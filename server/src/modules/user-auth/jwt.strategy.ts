import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  openid: string;
  role: string;
  hasProfile: boolean;
}

/**
 * JWT 策略——从 Authorization Header 提取 Bearer Token 并验证
 * 验证成功后返回用户基本信息（userId、openid、role、hasProfile）
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret'),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      openid: payload.openid,
      role: payload.role,
      hasProfile: payload.hasProfile,
    };
  }
}
