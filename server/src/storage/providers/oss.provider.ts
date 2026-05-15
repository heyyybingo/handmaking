import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OSS = require('ali-oss');
import { IStorageService } from '../storage.interface';

/**
 * 阿里云OSS存储Provider
 * 生产阶段使用的云存储服务
 * 实现IStorageService接口，支持预签名URL直传模式
 */
@Injectable()
export class OssProvider implements IStorageService {
  private readonly client: OSS;
  private readonly bucket: string;
  private readonly cdnDomain: string;
  private readonly logger = new Logger(OssProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('OSS_BUCKET', 'handcraft-prod');
    this.cdnDomain = this.configService.get<string>('CDN_DOMAIN', '');

    this.client = new OSS({
      region: this.configService.get<string>('OSS_REGION', 'oss-cn-hangzhou'),
      accessKeyId: this.configService.get<string>('OSS_ACCESS_KEY', ''),
      accessKeySecret: this.configService.get<string>('OSS_SECRET_KEY', ''),
      bucket: this.bucket,
      endpoint: this.configService.get<string>('OSS_ENDPOINT') || undefined,
    });
  }

  async getPresignedUrl(key: string, action: 'upload' | 'download', expires: number = 3600): Promise<string> {
    try {
      if (action === 'upload') {
        const result = this.client.signatureUrl(key, {
          method: 'PUT',
          expires,
          'Content-Type': 'application/octet-stream',
        });
        return result;
      }
      const result = this.client.signatureUrl(key, {
        method: 'GET',
        expires,
      });
      return result;
    } catch (error) {
      this.logger.error(`获取预签名URL失败: key=${key}, action=${action}`, error);
      throw error;
    }
  }

  async confirmUpload(key: string): Promise<void> {
    try {
      await this.client.head(key);
    } catch (error) {
      this.logger.error(`确认上传失败，文件不存在: key=${key}`, error);
      throw new Error(`文件上传确认失败: ${key}`);
    }
  }

  getFileUrl(key: string): string {
    if (this.cdnDomain) {
      return `${this.cdnDomain}/${key}`;
    }
    return `https://${this.bucket}.${this.configService.get<string>('OSS_REGION', 'oss-cn-hangzhou')}.aliyuncs.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.delete(key);
    } catch (error) {
      this.logger.error(`删除文件失败: key=${key}`, error);
      throw error;
    }
  }

  async generateThumbnails(key: string): Promise<void> {
    // 缩略图生成由ImageProcessorService处理
    this.logger.log(`缩略图生成请求: key=${key}，由ImageProcessorService处理`);
  }
}
