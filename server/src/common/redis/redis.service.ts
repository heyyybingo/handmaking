import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis缓存服务
 * 封装ioredis，提供缓存读写、过期设置、计数器等常用操作
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD', 'handcraft-dev-redis'),
      db: 0,
    });
  }

  /**
   * 获取Redis原生客户端（用于特殊操作）
   * @returns Redis客户端实例
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * 设置缓存键值对
   * @param key - 缓存键
   * @param value - 缓存值
   * @param ttlSeconds - 过期时间（秒），可选
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * 获取缓存值
   * @param key - 缓存键
   * @returns 缓存值，不存在则返回null
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * 删除缓存键
   * @param key - 缓存键
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * 递增计数器
   * @param key - 计数器键
   * @param increment - 递增量，默认1
   * @returns 递增后的值
   */
  async incr(key: string, increment: number = 1): Promise<number> {
    if (increment === 1) {
      return this.client.incr(key);
    }
    return this.client.incrby(key, increment);
  }

  /**
   * 递减计数器
   * @param key - 计数器键
   * @param decrement - 递减量，默认1
   * @returns 递减后的值
   */
  async decr(key: string, decrement: number = 1): Promise<number> {
    if (decrement === 1) {
      return this.client.decr(key);
    }
    return this.client.decrby(key, decrement);
  }

  /**
   * 设置键过期时间
   * @param key - 缓存键
   * @param ttlSeconds - 过期时间（秒）
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  /**
   * 检查键是否存在
   * @param key - 缓存键
   * @returns 是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * 批量删除匹配模式的键
   * @param pattern - 键匹配模式（如 craft:likes:*）
   */
  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * 模块销毁时关闭Redis连接
   */
  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
