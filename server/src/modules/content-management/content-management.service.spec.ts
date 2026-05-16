import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentManagementService } from './content-management.service';
import { Craft, CraftStatus } from '@/entities/craft.entity';
import { Category } from '@/entities/category.entity';
import { IStorageService } from '@/storage/storage.interface';
import {
  CreateCraftDto,
  UpdateCraftDto,
  BatchActionDto,
  BatchAction,
  CreateCategoryDto,
  UpdateCategoryDto,
  PresignDto,
  ConfirmUploadDto,
  FileType,
} from './dto';

describe('ContentManagementService', () => {
  let service: ContentManagementService;
  let craftRepo: Record<string, jest.Mock>;
  let categoryRepo: Record<string, jest.Mock>;
  let storageService: Record<string, jest.Mock>;

  const mockCraft = (overrides: Partial<Craft> = {}): Craft =>
    ({
      id: 'craft-uuid-1',
      title: '手工编织花篮',
      description: '一个精美的手工编织花篮',
      images: [],
      video: null,
      category_id: 'category-uuid-1',
      category: { id: 'category-uuid-1', name: '编织', icon: 'icon', sort_order: 0, created_at: new Date(), crafts: [] },
      tags: ['编织'],
      status: CraftStatus.DRAFT,
      like_count: 0,
      comment_count: 0,
      intent_count: 0,
      sort_order: 0,
      deleted_at: null,
      created_at: new Date('2025-01-15T10:00:00Z'),
      updated_at: new Date('2025-01-15T10:00:00Z'),
      ...overrides,
    }) as unknown as Craft;

  const mockCategory = (overrides: Partial<Category> = {}): Category =>
    ({
      id: 'category-uuid-1',
      name: '编织',
      icon: 'icon-url',
      sort_order: 0,
      created_at: new Date('2025-01-01'),
      crafts: [],
      ...overrides,
    }) as unknown as Category;

  beforeEach(async () => {
    jest.clearAllMocks();

    craftRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    categoryRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    };

    storageService = {
      getPresignedUrl: jest.fn(),
      confirmUpload: jest.fn(),
      getFileUrl: jest.fn(),
      deleteFile: jest.fn(),
      generateThumbnails: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentManagementService,
        {
          provide: getRepositoryToken(Craft),
          useValue: craftRepo,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: categoryRepo,
        },
        {
          provide: 'IStorageService',
          useValue: storageService,
        },
      ],
    }).compile();

    service = module.get<ContentManagementService>(ContentManagementService);
  });

  describe('createCraft', () => {
    const dto: CreateCraftDto = {
      title: '新作品',
      description: '描述',
      category_id: 'category-uuid-1',
      tags: ['标签1'],
    };

    it('should create a craft with default DRAFT status', async () => {
      const craft = mockCraft({ title: '新作品', status: CraftStatus.DRAFT });
      craftRepo.create.mockReturnValue(craft);
      craftRepo.save.mockResolvedValue(craft);

      const result = await service.createCraft(dto);

      expect(result.title).toBe('新作品');
      expect(result.status).toBe(CraftStatus.DRAFT);
      expect(craftRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '新作品',
          status: CraftStatus.DRAFT,
          sort_order: 0,
        }),
      );
    });

    it('should create a craft with explicit status', async () => {
      const dtoWithStatus: CreateCraftDto = {
        ...dto,
        status: CraftStatus.PUBLISHED,
      };
      const craft = mockCraft({
        title: '新作品',
        status: CraftStatus.PUBLISHED,
      });
      craftRepo.create.mockReturnValue(craft);
      craftRepo.save.mockResolvedValue(craft);

      const result = await service.createCraft(dtoWithStatus);

      expect(result.status).toBe(CraftStatus.PUBLISHED);
    });

    it('should create a craft with images and video', async () => {
      const dtoWithMedia: CreateCraftDto = {
        title: '多媒体作品',
        category_id: 'category-uuid-1',
        images: [{ url: 'img.jpg', width: 800, height: 600, sort: 0 }],
        video: { url: 'video.mp4', coverUrl: 'cover.jpg', duration: 120 },
      };
      const craft = mockCraft({ title: '多媒体作品' });
      craftRepo.create.mockReturnValue(craft);
      craftRepo.save.mockResolvedValue(craft);

      await service.createCraft(dtoWithMedia);

      expect(craftRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          images: dtoWithMedia.images,
          video: dtoWithMedia.video,
        }),
      );
    });
  });

  describe('updateCraft', () => {
    it('should update craft fields', async () => {
      const existingCraft = mockCraft();
      craftRepo.findOne.mockResolvedValue(existingCraft);
      craftRepo.save.mockResolvedValue(existingCraft);

      const dto: UpdateCraftDto = {
        title: '更新后的标题',
        status: CraftStatus.PUBLISHED,
      };

      await service.updateCraft('craft-uuid-1', dto);

      expect(existingCraft.title).toBe('更新后的标题');
      expect(existingCraft.status).toBe(CraftStatus.PUBLISHED);
      expect(craftRepo.save).toHaveBeenCalledWith(existingCraft);
    });

    it('should throw NotFoundException when craft not found', async () => {
      craftRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateCraft('non-existent', { title: 'new' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when craft is soft deleted', async () => {
      const deletedCraft = mockCraft({ deleted_at: new Date() });
      craftRepo.findOne.mockResolvedValue(deletedCraft);

      await expect(
        service.updateCraft('craft-uuid-1', { title: 'new' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should only update provided fields', async () => {
      const existingCraft = mockCraft({ title: '原标题', description: '原描述' });
      craftRepo.findOne.mockResolvedValue(existingCraft);
      craftRepo.save.mockResolvedValue(existingCraft);

      await service.updateCraft('craft-uuid-1', { title: '新标题' });

      expect(existingCraft.title).toBe('新标题');
      expect(existingCraft.description).toBe('原描述'); // unchanged
    });

    it('should update tags when provided', async () => {
      const existingCraft = mockCraft({ tags: ['旧标签'] });
      craftRepo.findOne.mockResolvedValue(existingCraft);
      craftRepo.save.mockResolvedValue(existingCraft);

      await service.updateCraft('craft-uuid-1', { tags: ['新标签1', '新标签2'] });

      expect(existingCraft.tags).toEqual(['新标签1', '新标签2']);
    });
  });

  describe('deleteCraft', () => {
    it('should soft delete a craft', async () => {
      const craft = mockCraft();
      craftRepo.findOne.mockResolvedValue(craft);

      await service.deleteCraft('craft-uuid-1');

      expect(craft.deleted_at).toBeInstanceOf(Date);
      expect(craftRepo.save).toHaveBeenCalledWith(craft);
    });

    it('should throw NotFoundException when craft not found', async () => {
      craftRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteCraft('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when craft is already deleted', async () => {
      const deletedCraft = mockCraft({ deleted_at: new Date() });
      craftRepo.findOne.mockResolvedValue(deletedCraft);

      await expect(service.deleteCraft('craft-uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAdminCrafts', () => {
    it('should return all crafts (including all statuses)', async () => {
      const crafts = [mockCraft({ status: CraftStatus.DRAFT }), mockCraft({ id: 'c2', status: CraftStatus.PUBLISHED })];

      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(crafts),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAdminCrafts({ limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it('should filter by status when provided', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAdminCrafts({ limit: 10, status: CraftStatus.DRAFT });

      expect(qb.andWhere).toHaveBeenCalledWith('craft.status = :status', {
        status: CraftStatus.DRAFT,
      });
    });

    it('should not filter by status when not provided', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAdminCrafts({ limit: 10 });

      // andWhere should not be called for status
      const statusCalls = (qb.andWhere as jest.Mock).mock.calls.filter(
        (call: any[]) => call[0]?.includes('status'),
      );
      expect(statusCalls).toHaveLength(0);
    });
  });

  describe('batchOperation', () => {
    const craftIds = ['c1', 'c2', 'c3'];

    it('should publish multiple crafts', async () => {
      const crafts = craftIds.map((id) => mockCraft({ id }));
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(crafts),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const dto: BatchActionDto = {
        ids: craftIds,
        action: BatchAction.PUBLISH,
      };

      await service.batchOperation(dto);

      expect(craftRepo.update).toHaveBeenCalledWith(craftIds, {
        status: CraftStatus.PUBLISHED,
      });
    });

    it('should unpublish multiple crafts', async () => {
      const crafts = craftIds.map((id) => mockCraft({ id }));
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(crafts),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const dto: BatchActionDto = {
        ids: craftIds,
        action: BatchAction.UNPUBLISH,
      };

      await service.batchOperation(dto);

      expect(craftRepo.update).toHaveBeenCalledWith(craftIds, {
        status: CraftStatus.DRAFT,
      });
    });

    it('should archive multiple crafts', async () => {
      const crafts = craftIds.map((id) => mockCraft({ id }));
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(crafts),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const dto: BatchActionDto = {
        ids: craftIds,
        action: BatchAction.ARCHIVE,
      };

      await service.batchOperation(dto);

      expect(craftRepo.update).toHaveBeenCalledWith(craftIds, {
        status: CraftStatus.ARCHIVED,
      });
    });

    it('should batch soft delete crafts', async () => {
      const crafts = craftIds.map((id) => mockCraft({ id }));
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(crafts),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const dto: BatchActionDto = {
        ids: craftIds,
        action: BatchAction.DELETE,
      };

      await service.batchOperation(dto);

      expect(craftRepo.update).toHaveBeenCalledWith(
        craftIds,
        expect.objectContaining({ deleted_at: expect.any(Date) }),
      );
    });

    it('should move crafts to another category', async () => {
      const crafts = craftIds.map((id) => mockCraft({ id }));
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(crafts),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const dto: BatchActionDto = {
        ids: craftIds,
        action: BatchAction.MOVE_CATEGORY,
        category_id: 'new-category-uuid',
      };

      await service.batchOperation(dto);

      expect(craftRepo.update).toHaveBeenCalledWith(craftIds, {
        category_id: 'new-category-uuid',
      });
    });

    it('should throw BadRequestException for move_category without category_id', async () => {
      const dto: BatchActionDto = {
        ids: craftIds,
        action: BatchAction.MOVE_CATEGORY,
      };

      await expect(service.batchOperation(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when no valid crafts found', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const dto: BatchActionDto = {
        ids: craftIds,
        action: BatchAction.PUBLISH,
      };

      await expect(service.batchOperation(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should only operate on valid (non-deleted) crafts', async () => {
      const validCrafts = [mockCraft({ id: 'c1' })];
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(validCrafts),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const dto: BatchActionDto = {
        ids: ['c1', 'c2-deleted', 'c3-deleted'],
        action: BatchAction.PUBLISH,
      };

      await service.batchOperation(dto);

      expect(craftRepo.update).toHaveBeenCalledWith(['c1'], {
        status: CraftStatus.PUBLISHED,
      });
    });
  });

  describe('createCategory', () => {
    const dto: CreateCategoryDto = {
      name: '新分类',
      icon: 'icon-url',
      sort_order: 5,
    };

    it('should create a new category', async () => {
      categoryRepo.findOne.mockResolvedValue(null); // no duplicate
      const category = mockCategory({ name: '新分类', sort_order: 5 });
      categoryRepo.create.mockReturnValue(category);
      categoryRepo.save.mockResolvedValue(category);

      const result = await service.createCategory(dto);

      expect(result.name).toBe('新分类');
      expect(result.sort_order).toBe(5);
    });

    it('should throw BadRequestException when category name already exists', async () => {
      categoryRepo.findOne.mockResolvedValue(mockCategory({ name: '新分类' }));

      await expect(service.createCategory(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should default sort_order to 0 when not provided', async () => {
      categoryRepo.findOne.mockResolvedValue(null);
      const category = mockCategory({ name: '分类', sort_order: 0 });
      categoryRepo.create.mockReturnValue(category);
      categoryRepo.save.mockResolvedValue(category);

      const dtoNoSort: CreateCategoryDto = { name: '分类' };
      await service.createCategory(dtoNoSort);

      expect(categoryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ sort_order: 0 }),
      );
    });
  });

  describe('updateCategory', () => {
    it('should update category fields', async () => {
      const existing = mockCategory({ name: '旧名称', sort_order: 0 });
      categoryRepo.findOne.mockResolvedValue(existing);
      categoryRepo.save.mockResolvedValue(existing);

      const dto: UpdateCategoryDto = { name: '新名称', sort_order: 10 };

      await service.updateCategory('category-uuid-1', dto);

      expect(existing.name).toBe('新名称');
      expect(existing.sort_order).toBe(10);
    });

    it('should throw NotFoundException when category not found', async () => {
      categoryRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateCategory('non-existent', { name: '新' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCategory', () => {
    it('should delete category when no crafts reference it', async () => {
      const category = mockCategory();
      categoryRepo.findOne.mockResolvedValue(category);

      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      await service.deleteCategory('category-uuid-1');

      expect(categoryRepo.remove).toHaveBeenCalledWith(category);
    });

    it('should throw BadRequestException when category has referenced crafts', async () => {
      const category = mockCategory();
      categoryRepo.findOne.mockResolvedValue(category);

      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(service.deleteCategory('category-uuid-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when category not found', async () => {
      categoryRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteCategory('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllCategories', () => {
    it('should return all categories sorted by sort_order ASC', async () => {
      const categories = [
        mockCategory({ id: 'c1', name: '编织', sort_order: 0 }),
        mockCategory({ id: 'c2', name: '木工', sort_order: 1 }),
        mockCategory({ id: 'c3', name: '陶艺', sort_order: 2 }),
      ];
      categoryRepo.find.mockResolvedValue(categories);

      const result = await service.findAllCategories();

      expect(result).toHaveLength(3);
      expect(categoryRepo.find).toHaveBeenCalledWith({
        order: { sort_order: 'ASC' },
      });
    });

    it('should return empty array when no categories', async () => {
      categoryRepo.find.mockResolvedValue([]);

      const result = await service.findAllCategories();

      expect(result).toHaveLength(0);
    });
  });

  describe('reorderCategories', () => {
    it('should update sort_order for each category in sequence', async () => {
      const ids = ['c3', 'c1', 'c2'];

      await service.reorderCategories(ids);

      expect(categoryRepo.update).toHaveBeenCalledTimes(3);
      expect(categoryRepo.update).toHaveBeenCalledWith('c3', { sort_order: 0 });
      expect(categoryRepo.update).toHaveBeenCalledWith('c1', { sort_order: 1 });
      expect(categoryRepo.update).toHaveBeenCalledWith('c2', { sort_order: 2 });
    });

    it('should handle empty array', async () => {
      await service.reorderCategories([]);

      expect(categoryRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('getPresignedUrl', () => {
    it('should generate presigned URL for image upload', async () => {
      storageService.getPresignedUrl.mockResolvedValue(
        'https://storage.example.com/upload?token=abc',
      );

      const dto: PresignDto = {
        filename: 'craft-photo.jpg',
        fileType: FileType.IMAGE,
      };

      const result = await service.getPresignedUrl(dto);

      expect(result.url).toBe('https://storage.example.com/upload?token=abc');
      expect(result.key).toContain('crafts/images/');
      expect(storageService.getPresignedUrl).toHaveBeenCalledWith(
        expect.stringContaining('crafts/images/'),
        'upload',
      );
    });

    it('should generate presigned URL for video upload', async () => {
      storageService.getPresignedUrl.mockResolvedValue(
        'https://storage.example.com/upload?token=def',
      );

      const dto: PresignDto = {
        filename: 'craft-video.mp4',
        fileType: FileType.VIDEO,
      };

      const result = await service.getPresignedUrl(dto);

      expect(result.key).toContain('crafts/videos/');
    });
  });

  describe('confirmUpload', () => {
    it('should confirm upload and trigger thumbnail generation for images', async () => {
      storageService.confirmUpload.mockResolvedValue(undefined);
      storageService.generateThumbnails.mockResolvedValue(undefined);
      storageService.getFileUrl.mockReturnValue(
        'https://storage.example.com/crafts/images/uuid/photo.jpg',
      );

      const dto: ConfirmUploadDto = {
        key: 'crafts/images/uuid/photo.jpg',
      };

      const result = await service.confirmUpload(dto);

      expect(result.url).toBe(
        'https://storage.example.com/crafts/images/uuid/photo.jpg',
      );
      expect(storageService.confirmUpload).toHaveBeenCalledWith(dto.key);
      expect(storageService.generateThumbnails).toHaveBeenCalledWith(dto.key);
    });

    it('should not generate thumbnails for video uploads', async () => {
      storageService.confirmUpload.mockResolvedValue(undefined);
      storageService.getFileUrl.mockReturnValue(
        'https://storage.example.com/crafts/videos/uuid/video.mp4',
      );

      const dto: ConfirmUploadDto = {
        key: 'crafts/videos/uuid/video.mp4',
      };

      const result = await service.confirmUpload(dto);

      expect(result.url).toBe(
        'https://storage.example.com/crafts/videos/uuid/video.mp4',
      );
      expect(storageService.generateThumbnails).not.toHaveBeenCalled();
    });
  });
});