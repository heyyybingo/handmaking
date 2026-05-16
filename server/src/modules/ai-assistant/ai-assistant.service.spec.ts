import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAssistantService } from './ai-assistant.service';
import { AiConfig } from './entities/ai-config.entity';
import { NotFoundException } from '@nestjs/common';

describe('AiAssistantService', () => {
  let service: AiAssistantService;
  let repository: Repository<AiConfig>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAssistantService,
        {
          provide: getRepositoryToken(AiConfig),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AiAssistantService>(AiAssistantService);
    repository = module.get<Repository<AiConfig>>(getRepositoryToken(AiConfig));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConfig', () => {
    it('should return config when found', async () => {
      const mockConfig = { id: '1', feature: 'description', isEnabled: true };
      mockRepository.findOne.mockResolvedValue(mockConfig);

      const result = await service.getConfig('description');
      expect(result).toEqual(mockConfig);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getConfig('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateConfig', () => {
    it('should create new config when not exists', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ feature: 'description', promptTemplate: 'test' });
      mockRepository.save.mockResolvedValue({ feature: 'description', promptTemplate: 'test' });

      const result = await service.updateConfig('description', { promptTemplate: 'test' });
      expect(result.feature).toBe('description');
    });

    it('should update existing config', async () => {
      const existing = { id: '1', feature: 'description', promptTemplate: 'old' };
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockResolvedValue({ ...existing, promptTemplate: 'new' });

      const result = await service.updateConfig('description', { promptTemplate: 'new' });
      expect(result.promptTemplate).toBe('new');
    });
  });

  describe('generateDescription', () => {
    it('should generate description when enabled', async () => {
      mockRepository.findOne.mockResolvedValue({
        feature: 'description',
        isEnabled: true,
        promptTemplate: 'Generate description for {{imageUrls}}',
        model: 'gpt-4',
        temperature: 0.7,
      });

      const result = await service.generateDescription({
        imageUrls: ['http://example.com/image.jpg'],
      });

      expect(result.description).toBeDefined();
    });

    it('should throw error when disabled', async () => {
      mockRepository.findOne.mockResolvedValue({
        feature: 'description',
        isEnabled: false,
      });

      await expect(
        service.generateDescription({ imageUrls: ['http://example.com/image.jpg'] }),
      ).rejects.toThrow('AI描述生成功能已禁用');
    });
  });

  describe('suggestTags', () => {
    it('should suggest tags when enabled', async () => {
      mockRepository.findOne.mockResolvedValue({
        feature: 'tags',
        isEnabled: true,
        promptTemplate: 'Suggest tags for {{imageUrl}}',
        model: 'gpt-4',
        temperature: 0.7,
      });

      const result = await service.suggestTags({
        imageUrl: 'http://example.com/image.jpg',
      });

      expect(result.tags).toBeDefined();
      expect(Array.isArray(result.tags)).toBe(true);
    });
  });
});
