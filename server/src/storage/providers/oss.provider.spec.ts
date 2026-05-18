import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OssProvider } from './oss.provider';

// Mock ali-oss module
jest.mock('ali-oss', () => {
  return jest.fn().mockImplementation(() => ({
    signatureUrl: jest
      .fn()
      .mockReturnValue('https://mock-presigned-url.com/file'),
    head: jest.fn().mockRejectedValue(new Error('Not Found')),
    delete: jest.fn().mockRejectedValue(new Error('Not Found')),
  }));
});

import OSS = require('ali-oss');

describe('OssProvider', () => {
  let provider: OssProvider;

  const mockConfig: Record<string, string> = {
    OSS_ENDPOINT: 'oss-cn-hangzhou.aliyuncs.com',
    OSS_REGION: 'oss-cn-hangzhou',
    OSS_ACCESS_KEY: 'test-access-key',
    OSS_SECRET_KEY: 'test-secret-key',
    OSS_BUCKET: 'handcraft-prod',
    CDN_DOMAIN: 'https://cdn.handcraft.example.com',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OssProvider,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultValue?: any) => {
              return mockConfig[key] ?? defaultValue;
            },
          },
        },
      ],
    }).compile();

    provider = module.get<OssProvider>(OssProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should construct OSS client with correct config', () => {
    expect(OSS).toHaveBeenCalledWith({
      region: 'oss-cn-hangzhou',
      accessKeyId: 'test-access-key',
      accessKeySecret: 'test-secret-key',
      bucket: 'handcraft-prod',
      endpoint: 'oss-cn-hangzhou.aliyuncs.com',
    });
  });

  describe('getFileUrl', () => {
    it('should return CDN URL when CDN_DOMAIN is set', () => {
      const url = provider.getFileUrl('images/test.jpg');
      expect(url).toBe('https://cdn.handcraft.example.com/images/test.jpg');
    });

    it('should return OSS direct URL when CDN_DOMAIN is not set', async () => {
      const noCdnConfig: Record<string, string> = {
        ...mockConfig,
        CDN_DOMAIN: '',
      };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OssProvider,
          {
            provide: ConfigService,
            useValue: {
              get: (key: string, defaultValue?: any) =>
                noCdnConfig[key] ?? defaultValue,
            },
          },
        ],
      }).compile();

      const noCdnProvider = module.get<OssProvider>(OssProvider);
      const url = noCdnProvider.getFileUrl('images/test.jpg');
      expect(url).toBe(
        'https://handcraft-prod.oss-cn-hangzhou.aliyuncs.com/images/test.jpg',
      );
    });
  });

  describe('generateThumbnails', () => {
    it('should log thumbnail request without error', async () => {
      await expect(
        provider.generateThumbnails('images/test.jpg'),
      ).resolves.toBeUndefined();
    });
  });

  describe('getPresignedUrl', () => {
    it('should return presigned URL for upload', async () => {
      const url = await provider.getPresignedUrl('images/test.jpg', 'upload');
      expect(url).toBe('https://mock-presigned-url.com/file');
    });

    it('should return presigned URL for download', async () => {
      const url = await provider.getPresignedUrl('images/test.jpg', 'download');
      expect(url).toBe('https://mock-presigned-url.com/file');
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
