import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IStorageService } from './storage.interface';
import { MinioProvider } from './providers/minio.provider';
import { OssProvider } from './providers/oss.provider';
import { ImageProcessorService } from './image-processor.service';

/**
 * 存储模块
 * 根据STORAGE_PROVIDER环境变量注册对应的存储Provider
 * minio: 开发阶段使用MinIO
 * oss: 生产阶段使用阿里云/腾讯云OSS
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'IStorageService',
      useFactory: (configService: ConfigService): IStorageService => {
        const provider = configService.get<string>('STORAGE_PROVIDER', 'minio');
        switch (provider) {
          case 'minio':
            return new MinioProvider(configService);
          case 'oss':
            return new OssProvider(configService);
          default:
            throw new Error(`不支持的 STORAGE_PROVIDER: ${provider}`);
        }
      },
      inject: [ConfigService],
    },
    ImageProcessorService,
  ],
  exports: ['IStorageService', ImageProcessorService],
})
export class StorageModule {}
