import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT 认证守卫——基于 Passport JWT 策略，验证请求中的 Bearer Token
 * 验证通过后将用户信息挂载到 request.user
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
