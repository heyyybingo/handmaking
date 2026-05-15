import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { IStorageService } from './storage.interface';
import { MinioProvider } from './providers/minio.provider';
import { OssProvider } from './providers/oss.provider';
import { StorageModule } from './storage.module';

// Mock ali-oss for OSS provider tests
jest.mock('ali-oss', () => {
  return jest.fn().mockImplementation(() => ({
    signatureUrl: jest.fn().mockReturnValue('https://mock-url.com/file'),
    head: jest.fn().mockRejectedValue(new Error('Not Found')),
    delete: jest.fn().mockRejectedValue(new Error('Not Found')),
  }));
});

describe('StorageModule', () => {
  describe('with STORAGE_PROVIDER=minio', () => {
    it('should provide MinioProvider', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              () => ({
                STORAGE_PROVIDER: 'minio',
                MINIO_ENDPOINT: 'localhost',
                MINIO_API_PORT: 9000,
                MINIO_USE_SSL: false,
                MINIO_BUCKET: 'handcraft',
                MINIO_ACCESS_KEY: 'test',
                MINIO_SECRET_KEY: 'test',
              }),
            ],
          }),
          StorageModule,
        ],
      }).compile();

      const storageService = module.get<IStorageService>('IStorageService');
      expect(storageService).toBeInstanceOf(MinioProvider);
    });
  });

  describe('with STORAGE_PROVIDER=oss', () => {
    it('should provide OssProvider', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              () => ({
                STORAGE_PROVIDER: 'oss',
                OSS_ENDPOINT: 'oss-cn-hangzhou.aliyuncs.com',
                OSS_REGION: 'oss-cn-hangzhou',
                OSS_ACCESS_KEY: 'test',
                OSS_SECRET_KEY: 'test',
                OSS_BUCKET: 'handcraft-prod',
              }),
            ],
          }),
          StorageModule,
        ],
      }).compile();

      const storageService = module.get<IStorageService>('IStorageService');
      expect(storageService).toBeInstanceOf(OssProvider);
    });
  });

  describe('with unsupported STORAGE_PROVIDER', () => {
    it('should throw error', async () => {
      await expect(
        Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [() => ({ STORAGE_PROVIDER: 'unsupported' })],
            }),
            StorageModule,
          ],
        }).compile(),
      ).rejects.toThrow('不支持的 STORAGE_PROVIDER: unsupported');
    });
  });
});
