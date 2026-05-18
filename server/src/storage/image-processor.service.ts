import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IStorageService } from './storage.interface';
import { THUMBNAIL_SIZES } from './storage.interface';
import sharp from 'sharp';

/**
 * 图片处理服务
 * 基于Sharp库，负责缩略图生成和WebP格式转换
 * 与具体存储Provider无关，通过IStorageService接口读写文件
 */
@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  constructor(
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
  ) {}

  /**
   * 处理上传的图片：生成多尺寸缩略图并转存WebP格式
   * @param key - 原始文件存储键（如 images/abc123.jpg）
   */
  async processUploadedImage(key: string): Promise<void> {
    try {
      this.logger.log(`开始处理图片: ${key}`);

      // 获取原始图片的预签名下载URL
      const downloadUrl = await this.storageService.getPresignedUrl(
        key,
        'download',
      );

      // 下载原始图片到Buffer
      const response = await fetch(downloadUrl);
      const imageBuffer = Buffer.from(await response.arrayBuffer());

      // 为每种尺寸生成缩略图
      for (const size of THUMBNAIL_SIZES) {
        const thumbnailBuffer = await sharp(imageBuffer)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: 80 })
          .toBuffer();

        // 生成缩略图存储键：images/abc123_200x200.webp
        const ext = 'webp';
        const baseKey = key.replace(/\.[^.]+$/, '');
        const thumbnailKey = `${baseKey}_${size.suffix}.${ext}`;

        // 获取上传预签名URL并上传
        const uploadUrl = await this.storageService.getPresignedUrl(
          thumbnailKey,
          'upload',
        );
        await fetch(uploadUrl, {
          method: 'PUT',
          body: new Uint8Array(thumbnailBuffer),
          headers: { 'Content-Type': 'image/webp' },
        });

        this.logger.log(`缩略图已生成: ${thumbnailKey}`);
      }

      // 原图也转换为WebP格式（优化存储和加载速度）
      const originalWebpBuffer = await sharp(imageBuffer)
        .webp({ quality: 90 })
        .toBuffer();

      const originalWebpKey = key.replace(/\.[^.]+$/, '.webp');
      const originalUploadUrl = await this.storageService.getPresignedUrl(
        originalWebpKey,
        'upload',
      );
      await fetch(originalUploadUrl, {
        method: 'PUT',
        body: new Uint8Array(originalWebpBuffer),
        headers: { 'Content-Type': 'image/webp' },
      });

      this.logger.log(`原图WebP已生成: ${originalWebpKey}`);
    } catch (error) {
      this.logger.error(`图片处理失败: key=${key}`, error);
      throw error;
    }
  }
}
