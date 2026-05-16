import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RedisService } from '../redis/redis.service';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 60,
};

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly logger = new Logger('RateLimit');

  constructor(private readonly redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<unknown> {
    const request = context.switchToHttp().getRequest();
    const key = this.getKey(request);
    const config = this.getConfig(request);

    const current = await this.redisService.incr(key);
    if (current === 1) {
      await this.redisService.expire(key, Math.ceil(config.windowMs / 1000));
    }

    if (current > config.maxRequests) {
      this.logger.warn(`Rate limit exceeded for ${key}`);
      throw new HttpException('请求过于频繁，请稍后再试', HttpStatus.TOO_MANY_REQUESTS);
    }

    return next.handle();
  }

  private getKey(request: any): string {
    const userId = request.user?.id;
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const prefix = userId ? `user:${userId}` : `ip:${ip}`;
    return `ratelimit:${prefix}`;
  }

  private getConfig(request: any): RateLimitConfig {
    const url = request.url;

    if (url.includes('/mini/auth/login')) {
      return { windowMs: 5 * 60 * 1000, maxRequests: 10 };
    }

    if (url.includes('/mini/crafts') && request.method === 'POST') {
      return { windowMs: 60 * 1000, maxRequests: 10 };
    }

    if (url.includes('/mini/comments') && request.method === 'POST') {
      return { windowMs: 60 * 1000, maxRequests: 20 };
    }

    return DEFAULT_CONFIG;
  }
}
