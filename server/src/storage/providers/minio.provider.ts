import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { IStorageService } from '../storage.interface';

/**
 * MinIO存储Provider
 * 开发阶段使用的本地S3兼容存储服务
 * 实现IStorageService接口，支持预签名URL直传模式
 */
@Injectable()
export class MinioProvider implements IStorageService {
  private readonly client: Minio.Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;
  private readonly logger = new Logger(MinioProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    this.port = this.configService.get<number>('MINIO_API_PORT', 9000);
    this.useSSL = this.configService.get<boolean>('MINIO_USE_SSL', false);
    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'handcraft');

    this.client = new Minio.Client({
      endPoint: this.endpoint,
      port: this.port,
      useSSL: this.useSSL,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'handcraft-dev'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'handcraft-dev-secret'),
    });
  }

  /**
   * 获取预签名URL
   * @param key - 文件存储键（如 images/abc123.jpg）
   * @param action - 操作类型：上传或下载
   * @param expires - 过期时间（秒），默认3600
   * @returns 预签名URL
   */
  async getPresignedUrl(key: string, action: 'upload' | 'download', expires: number = 3600): Promise<string> {
    try {
      if (action === 'upload') {
        return await this.client.presignedPutObject(this.bucket, key, expires);
      }
      return await this.client.presignedGetObject(this.bucket, key, expires);
    } catch (error) {
      this.logger.error(`获取预签名URL失败: key=${key}, action=${action}`, error);
      throw error;
    }
  }

  /**
   * 确认上传完成
   * 验证文件是否存在于bucket中
   * @param key - 文件存储键
   */
  async confirmUpload(key: string): Promise<void> {
    try {
      await this.client.statObject(this.bucket, key);
    } catch (error) {
      this.logger.error(`确认上传失败，文件不存在: key=${key}`, error);
      throw new Error(`文件上传确认失败: ${key}`);
    }
  }

  /**
   * 获取文件公开访问URL
   * 开发阶段直接拼接MinIO地址，生产阶段由OSS Provider返回CDN域名
   * @param key - 文件存储键
   * @returns 文件访问URL
   */
  getFileUrl(key: string): string {
    const protocol = this.useSSL ? 'https' : 'http';
    return `${protocol}://${this.endpoint}:${this.port}/${this.bucket}/${key}`;
  }

  /**
   * 删除文件
   * @param key - 文件存储键
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, key);
    } catch (error) {
      this.logger.error(`删除文件失败: key=${key}`, error);
      throw error;
    }
  }

  /**
   * 生成缩略图
   * 由ImageProcessorService调用，此方法为接口占位
   * 实际缩略图生成逻辑在ImageProcessorService中
   * @param key - 原始文件存储键
   */
  async generateThumbnails(key: string): Promise<void> {
    // 缩略图生成由ImageProcessorService处理
    // 此方法仅作为接口契约的占位
    this.logger.log(`缩略图生成请求: key=${key}，由ImageProcessorService处理`);
  }
}
