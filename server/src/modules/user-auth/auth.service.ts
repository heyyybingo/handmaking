import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@/entities/user.entity';
import { RedisService } from '@/common/redis/redis.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { WxLoginDto } from './dto/wx-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 管理员登录
   * 验证用户名密码，处理登录失败锁定逻辑
   */
  async adminLogin(dto: AdminLoginDto) {
    // 查找管理员用户：openid以admin-开头或角色为admin
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.openid LIKE :prefix', { prefix: 'admin-%' })
      .orWhere('user.role = :role', { role: UserRole.ADMIN })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查账户是否被锁定
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      const remainingMinutes = Math.ceil(
        (new Date(user.locked_until).getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `账户已被锁定，请${remainingMinutes}分钟后重试`,
      );
    }

    // 验证密码
    if (!user.password_hash) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      // 增加失败次数
      const failCount = user.login_fail_count + 1;
      const updates: Partial<User> = { login_fail_count: failCount };

      // 超过5次锁定15分钟
      if (failCount >= 5) {
        updates.locked_until = new Date(Date.now() + 15 * 60 * 1000);
      }

      await this.userRepository.update(user.id, updates);

      if (failCount >= 5) {
        throw new UnauthorizedException(
          '登录失败次数过多，账户已锁定15分钟',
        );
      }

      throw new UnauthorizedException(
        `用户名或密码错误，还剩${5 - failCount}次机会`,
      );
    }

    // 登录成功，重置失败计数
    await this.userRepository.update(user.id, {
      login_fail_count: 0,
      locked_until: undefined,
    });

    // 生成管理员token，24小时有效
    const payload = {
      sub: user.id,
      openid: user.openid,
      role: user.role,
      hasProfile: user.has_profile,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
    });

    return {
      accessToken,
      mustChangePassword: user.must_change_password,
    };
  }

  /**
   * 微信小程序登录
   * 通过wx.login获取的code换取openid，查找或创建用户
   */
  async wxLogin(dto: WxLoginDto) {
    const { openid } = await this.getWxOpenid(dto.code);

    // 查找或创建用户
    let user = await this.userRepository.findOne({ where: { openid } });

    if (!user) {
      user = this.userRepository.create({
        openid,
        role: UserRole.VISITOR,
        nickname: '手作爱好者',
        has_profile: false,
      });
      user = await this.userRepository.save(user);
    }

    // 生成访问token（7天）和刷新token（30天）
    const payload = {
      sub: user.id,
      openid: user.openid,
      role: user.role,
      hasProfile: user.has_profile,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      hasProfile: user.has_profile,
    };
  }

  /**
   * 刷新访问令牌
   * 验证refresh token有效后签发新的access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      // 验证用户是否仍然存在
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const newPayload = {
        sub: user.id,
        openid: user.openid,
        role: user.role,
        hasProfile: user.has_profile,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '7d',
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  /**
   * 更新用户资料
   * 首次完善资料后标记has_profile为true
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    await this.userRepository.update(userId, {
      nickname: dto.nickname,
      avatar_url: dto.avatarUrl ?? user.avatar_url,
      has_profile: true,
    });

    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    return {
      nickname: updatedUser!.nickname,
      avatarUrl: updatedUser!.avatar_url,
      hasProfile: updatedUser!.has_profile,
    };
  }

  /**
   * 修改管理员密码
   * 验证旧密码后更新为新密码
   */
  async changePassword(userId: string, dto: AdminChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    if (!user.password_hash) {
      throw new BadRequestException('当前用户未设置密码');
    }

    const isOldPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password_hash,
    );

    if (!isOldPasswordValid) {
      throw new BadRequestException('当前密码错误');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepository.update(userId, {
      password_hash: newPasswordHash,
      must_change_password: false,
    });

    return { message: '密码修改成功' };
  }

  /**
   * 验证用户（供JWT策略使用）
   * 根据用户ID查找用户
   */
  async validateUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    return {
      userId: user.id,
      openid: user.openid,
      role: user.role,
      hasProfile: user.has_profile,
      nickname: user.nickname,
      avatarUrl: user.avatar_url,
    };
  }

  /**
   * 调用微信code2Session接口获取openid
   */
  private async getWxOpenid(code: string): Promise<{ openid: string }> {
    const appid = this.configService.get<string>('WX_APPID');
    const secret = this.configService.get<string>('WX_SECRET');

    if (!appid || !secret) {
      throw new BadRequestException('微信登录配置缺失');
    }

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    try {
      const response = await fetch(url);
      const data = (await response.json()) as {
        openid?: string;
        session_key?: string;
        errcode?: number;
        errmsg?: string;
      };

      if (data.errcode || !data.openid) {
        this.logger.error(
          `微信登录失败: errcode=${data.errcode}, errmsg=${data.errmsg}`,
        );
        throw new UnauthorizedException('微信登录失败');
      }

      return { openid: data.openid };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('微信登录接口调用失败', error);
      throw new UnauthorizedException('微信登录服务暂时不可用');
    }
  }
}
