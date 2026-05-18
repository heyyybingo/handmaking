import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from '../redis/redis.service';

interface CacheConfig {
  ttlSeconds: number;
  keyPrefix: string;
}

const CACHE_CONFIGS: Record<string, CacheConfig> = {
  '/mini/crafts': { ttlSeconds: 30, keyPrefix: 'cache:crafts' },
  '/mini/categories': { ttlSeconds: 300, keyPrefix: 'cache:categories' },
  '/mini/crafts/search': { ttlSeconds: 60, keyPrefix: 'cache:search' },
};

/**
 * 缓存拦截器——对 GET 请求进行 Redis 缓存，减少数据库查询
 * 仅对配置了缓存规则的路由生效（如作品列表、分类列表、搜索）
 * 非 GET 请求直接放行，不缓存
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Cache');

  constructor(private readonly redisService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<unknown> {
    const request = context.switchToHttp().getRequest();

    if (request.method !== 'GET') {
      return next.handle();
    }

    const config = this.getCacheConfig(request.url);
    if (!config) {
      return next.handle();
    }

    const cacheKey = this.buildCacheKey(request, config);
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit: ${cacheKey}`);
      return of(JSON.parse(cached));
    }

    return next.handle().pipe(
      tap(async (data) => {
        if (data) {
          await this.redisService.set(
            cacheKey,
            JSON.stringify(data),
            config.ttlSeconds,
          );
          this.logger.debug(
            `Cache set: ${cacheKey} (TTL: ${config.ttlSeconds}s)`,
          );
        }
      }),
    );
  }

  private getCacheConfig(url: string): CacheConfig | null {
    for (const [pattern, config] of Object.entries(CACHE_CONFIGS)) {
      if (url.includes(pattern)) {
        return config;
      }
    }
    return null;
  }

  private buildCacheKey(request: any, config: CacheConfig): string {
    const { url, query } = request;
    const queryString = Object.keys(query || {})
      .sort()
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    return `${config.keyPrefix}:${url}${queryString ? `?${queryString}` : ''}`;
  }
}
