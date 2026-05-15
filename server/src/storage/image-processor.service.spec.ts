import { Test, TestingModule } from '@nestjs/testing';
import { ImageProcessorService } from './image-processor.service';
import { IStorageService } from './storage.interface';

describe('ImageProcessorService', () => {
  let service: ImageProcessorService;
  let storageService: IStorageService;

  const mockStorageService = {
    getPresignedUrl: jest.fn(),
    confirmUpload: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
    generateThumbnails: jest.fn(),
  };

  beforeEach(async () => {
    mockStorageService.getPresignedUrl.mockReset();
    mockStorageService.confirmUpload.mockReset();
    mockStorageService.getFileUrl.mockReset();
    mockStorageService.deleteFile.mockReset();
    mockStorageService.generateThumbnails.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageProcessorService,
        {
          provide: 'IStorageService',
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<ImageProcessorService>(ImageProcessorService);
    storageService = module.get<IStorageService>('IStorageService');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processUploadedImage', () => {
    it('should process image and generate thumbnails', async () => {
      // Mock: download URL returns a valid 1x1 pixel PNG
      const pixelPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'base64',
      );

      mockStorageService.getPresignedUrl.mockImplementation(
        (key: string, action: string) => {
          if (action === 'download') {
            return Promise.resolve('http://localhost:9000/download/' + key);
          }
          return Promise.resolve('http://localhost:9000/upload/' + key);
        },
      );

      // Mock fetch globally
      const originalFetch = globalThis.fetch;
      globalThis.fetch = jest.fn().mockImplementation((url: string, options?: any) => {
        if (options?.method === 'PUT') {
          return Promise.resolve(new Response(null, { status: 200 }));
        }
        // Download request
        return Promise.resolve(
          new Response(pixelPng, {
            status: 200,
            headers: { 'Content-Type': 'image/png' },
          }),
        );
      }) as any;

      await service.processUploadedImage('images/test.png');

      // Should call getPresignedUrl for download + 2 thumbnails + 1 original webp = 4 calls
      expect(mockStorageService.getPresignedUrl).toHaveBeenCalledWith(
        'images/test.png',
        'download',
      );
      expect(mockStorageService.getPresignedUrl).toHaveBeenCalledWith(
        'images/test_200x200.webp',
        'upload',
      );
      expect(mockStorageService.getPresignedUrl).toHaveBeenCalledWith(
        'images/test_400x400.webp',
        'upload',
      );
      expect(mockStorageService.getPresignedUrl).toHaveBeenCalledWith(
        'images/test.webp',
        'upload',
      );

      globalThis.fetch = originalFetch;
    });

    it('should throw when download URL fails', async () => {
      mockStorageService.getPresignedUrl.mockRejectedValue(new Error('URL generation failed'));

      await expect(service.processUploadedImage('images/test.jpg')).rejects.toThrow(
        'URL generation failed',
      );
    });

    it('should throw when image download fails', async () => {
      mockStorageService.getPresignedUrl.mockResolvedValue('http://localhost:9000/download/test.jpg');

      const originalFetch = globalThis.fetch;
      globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as any;

      await expect(service.processUploadedImage('images/test.jpg')).rejects.toThrow(
        'Network error',
      );

      globalThis.fetch = originalFetch;
    });
  });
});
