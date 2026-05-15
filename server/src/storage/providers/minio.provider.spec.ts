import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MinioProvider } from './minio.provider';

describe('MinioProvider', () => {
  let provider: MinioProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioProvider,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                MINIO_ENDPOINT: 'localhost',
                MINIO_API_PORT: 9000,
                MINIO_USE_SSL: false,
                MINIO_BUCKET: 'handcraft',
                MINIO_ACCESS_KEY: 'test-key',
                MINIO_SECRET_KEY: 'test-secret',
              };
              return config[key] ?? defaultValue;
            },
          },
        },
      ],
    }).compile();

    provider = module.get<MinioProvider>(MinioProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('getFileUrl', () => {
    it('should return correct URL with HTTP', () => {
      const url = provider.getFileUrl('images/test.jpg');
      expect(url).toBe('http://localhost:9000/handcraft/images/test.jpg');
    });

    it('should return correct URL with HTTPS when SSL enabled', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MinioProvider,
          {
            provide: ConfigService,
            useValue: {
              get: (key: string, defaultValue?: any) => {
                const config: Record<string, any> = {
                  MINIO_ENDPOINT: 'minio.example.com',
                  MINIO_API_PORT: 443,
                  MINIO_USE_SSL: true,
                  MINIO_BUCKET: 'handcraft',
                  MINIO_ACCESS_KEY: 'test-key',
                  MINIO_SECRET_KEY: 'test-secret',
                };
                return config[key] ?? defaultValue;
              },
            },
          },
        ],
      }).compile();

      const sslProvider = module.get<MinioProvider>(MinioProvider);
      const url = sslProvider.getFileUrl('images/test.jpg');
      expect(url).toBe('https://minio.example.com:443/handcraft/images/test.jpg');
    });
  });

  describe('generateThumbnails', () => {
    it('should log thumbnail request without error', async () => {
      await expect(provider.generateThumbnails('images/test.jpg')).resolves.toBeUndefined();
    });
  });

  describe('getPresignedUrl', () => {
    it('should throw on invalid bucket or key', async () => {
      await expect(provider.getPresignedUrl('', 'download')).rejects.toThrow();
    });
  });

  describe('confirmUpload', () => {
    it('should throw when file does not exist', async () => {
      await expect(provider.confirmUpload('nonexistent.jpg')).rejects.toThrow(
        '文件上传确认失败',
      );
    });
  });

  describe('deleteFile', () => {
    it('should throw on delete failure', async () => {
      await expect(provider.deleteFile('nonexistent.jpg')).rejects.toThrow();
    });
  });
});
