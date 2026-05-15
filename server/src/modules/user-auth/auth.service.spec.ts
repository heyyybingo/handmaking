import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User, UserRole } from '@/entities/user.entity';
import { RedisService } from '@/common/redis/redis.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { WxLoginDto } from './dto/wx-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Record<string, jest.Mock>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let redisService: RedisService;

  const mockUser = {
    id: 'user-uuid-1',
    openid: 'admin-default',
    nickname: '管理员',
    avatar_url: undefined,
    has_profile: true,
    role: UserRole.ADMIN,
    password_hash: '$2b$10$hashedpassword',
    login_fail_count: 0,
    locked_until: undefined,
    must_change_password: false,
    created_at: new Date(),
  } as unknown as User;

  const mockVisitor = {
    id: 'visitor-uuid-1',
    openid: 'wx-openid-123',
    nickname: '手作爱好者',
    avatar_url: undefined,
    has_profile: false,
    role: UserRole.VISITOR,
    password_hash: undefined,
    login_fail_count: 0,
    locked_until: undefined,
    must_change_password: false,
    created_at: new Date(),
  } as unknown as User;

  beforeEach(async () => {
    jest.clearAllMocks();
    userRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('signed-jwt-token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                JWT_SECRET: 'test-secret',
                WX_APPID: 'test-appid',
                WX_SECRET: 'test-secret',
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
            incr: jest.fn(),
            expire: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('adminLogin', () => {
    const dto: AdminLoginDto = {
      username: 'admin',
      password: 'Admin123',
    };

    it('should login successfully with correct credentials', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };
      userRepository.createQueryBuilder.mockReturnValue(qb);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.adminLogin(dto);

      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.mustChangePassword).toBe(false);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      userRepository.createQueryBuilder.mockReturnValue(qb);

      await expect(service.adminLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when account is locked', async () => {
      const lockedUser = {
        ...mockUser,
        locked_until: new Date(Date.now() + 10 * 60 * 1000),
      };
      const qb = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(lockedUser),
      };
      userRepository.createQueryBuilder.mockReturnValue(qb);

      await expect(service.adminLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };
      userRepository.createQueryBuilder.mockReturnValue(qb);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.adminLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        login_fail_count: 1,
      });
    });

    it('should lock account after 5 failed attempts', async () => {
      const failingUser = { ...mockUser, login_fail_count: 4 };
      const qb = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(failingUser),
      };
      userRepository.createQueryBuilder.mockReturnValue(qb);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.adminLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.update).toHaveBeenCalledWith(
        failingUser.id,
        expect.objectContaining({
          login_fail_count: 5,
          locked_until: expect.any(Date),
        }),
      );
    });

    it('should throw when user has no password_hash', async () => {
      const noPassUser = { ...mockUser, password_hash: undefined };
      const qb = {
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(noPassUser),
      };
      userRepository.createQueryBuilder.mockReturnValue(qb);

      await expect(service.adminLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('wxLogin', () => {
    const dto: WxLoginDto = { code: 'wx-code-123' };

    it('should return tokens for existing user', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({ openid: 'wx-openid-123', session_key: 'sk' }),
      });
      global.fetch = mockFetch;

      userRepository.findOne.mockResolvedValue(mockVisitor);

      const result = await service.wxLogin(dto);

      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.refreshToken).toBe('signed-jwt-token');
      expect(result.hasProfile).toBe(false);
    });

    it('should create new user and return tokens', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({ openid: 'wx-new-openid', session_key: 'sk' }),
      });
      global.fetch = mockFetch;

      userRepository.findOne.mockResolvedValue(null);
      const newUser = {
        id: 'new-uuid',
        openid: 'wx-new-openid',
        role: UserRole.VISITOR,
        nickname: '手作爱好者',
        has_profile: false,
      };
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(newUser);

      const result = await service.wxLogin(dto);

      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.hasProfile).toBe(false);
    });

    it('should throw UnauthorizedException when WeChat API returns error', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            errcode: 40029,
            errmsg: 'invalid code',
          }),
      });
      global.fetch = mockFetch;

      await expect(service.wxLogin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new access token for valid refresh token', async () => {
      const payload = {
        sub: 'visitor-uuid-1',
        openid: 'wx-openid-123',
        role: 'visitor',
        hasProfile: false,
      };
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      userRepository.findOne.mockResolvedValue(mockVisitor);

      const result = await service.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('signed-jwt-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('invalid'));

      await expect(
        service.refreshToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user no longer exists', async () => {
      const payload = {
        sub: 'deleted-uuid',
        openid: 'wx-openid-deleted',
        role: 'visitor',
        hasProfile: false,
      };
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.refreshToken('valid-but-deleted-user'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateProfile', () => {
    const dto: UpdateProfileDto = {
      nickname: '新昵称',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    it('should update profile and set has_profile to true', async () => {
      userRepository.findOne.mockResolvedValue(mockVisitor);
      userRepository.update.mockResolvedValue({ affected: 1 });

      const updatedUser = {
        ...mockVisitor,
        nickname: '新昵称',
        avatar_url: 'https://example.com/avatar.jpg',
        has_profile: true,
      };
      userRepository.findOne
        .mockResolvedValueOnce(mockVisitor)
        .mockResolvedValueOnce(updatedUser);

      const result = await service.updateProfile('visitor-uuid-1', dto);

      expect(userRepository.update).toHaveBeenCalledWith('visitor-uuid-1', {
        nickname: '新昵称',
        avatar_url: 'https://example.com/avatar.jpg',
        has_profile: true,
      });
    });

    it('should throw BadRequestException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existent', dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    const dto: AdminChangePasswordDto = {
      oldPassword: 'OldPass123',
      newPassword: 'NewPass456',
    };

    it('should change password successfully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedBcrypt.hash.mockResolvedValue('new-hash' as never);

      const result = await service.changePassword('user-uuid-1', dto);

      expect(result.message).toBe('密码修改成功');
      expect(userRepository.update).toHaveBeenCalledWith('user-uuid-1', {
        password_hash: 'new-hash',
        must_change_password: false,
      });
    });

    it('should throw BadRequestException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword('non-existent', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when old password is wrong', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.changePassword('user-uuid-1', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user has no password', async () => {
      const noPassUser = { ...mockUser, password_hash: undefined };
      userRepository.findOne.mockResolvedValue(noPassUser);

      await expect(
        service.changePassword('user-uuid-1', dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateUser', () => {
    it('should return user info when user exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-uuid-1');

      expect(result).toEqual({
        userId: mockUser.id,
        openid: mockUser.openid,
        role: mockUser.role,
        hasProfile: mockUser.has_profile,
        nickname: mockUser.nickname,
        avatarUrl: mockUser.avatar_url,
      });
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('non-existent');

      expect(result).toBeNull();
    });
  });
});
