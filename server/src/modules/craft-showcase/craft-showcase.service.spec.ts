import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CraftShowcaseService } from './craft-showcase.service';
import { Craft, CraftStatus } from '@/entities/craft.entity';
import { Category } from '@/entities/category.entity';
import { CraftQueryDto, CraftSearchDto } from './dto';

describe('CraftShowcaseService', () => {
  let service: CraftShowcaseService;
  let craftRepo: Record<string, jest.Mock>;
  let categoryRepo: Record<string, jest.Mock>;

  const mockCraft = (overrides: Partial<Craft> = {}): Craft =>
    ({
      id: 'craft-uuid-1',
      title: '手工编织花篮',
      description: '一个精美的手工编织花篮',
      images: [],
      video: null,
      category_id: 'category-uuid-1',
      category: {
        id: 'category-uuid-1',
        name: '编织',
        icon: 'icon-url',
        sort_order: 0,
        created_at: new Date('2025-01-01'),
        crafts: [],
      },
      tags: ['编织', '花篮'],
      status: CraftStatus.PUBLISHED,
      like_count: 10,
      comment_count: 3,
      intent_count: 1,
      sort_order: 0,
      deleted_at: null,
      created_at: new Date('2025-01-15T10:00:00Z'),
      updated_at: new Date('2025-01-15T10:00:00Z'),
      ...overrides,
    }) as unknown as Craft;

  beforeEach(async () => {
    jest.clearAllMocks();

    craftRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
    };

    categoryRepo = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CraftShowcaseService,
        {
          provide: getRepositoryToken(Craft),
          useValue: craftRepo,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: categoryRepo,
        },
      ],
    }).compile();

    service = module.get<CraftShowcaseService>(CraftShowcaseService);
  });

  describe('findAll', () => {
    const query: CraftQueryDto = { limit: 10 };

    it('should return published crafts with cursor pagination', async () => {
      const crafts = [
        mockCraft({ id: 'c1', created_at: new Date('2025-01-15T10:00:00Z') }),
        mockCraft({ id: 'c2', created_at: new Date('2025-01-14T10:00:00Z') }),
        mockCraft({ id: 'c3', created_at: new Date('2025-01-13T10:00:00Z') }),
      ];

      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(crafts),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll(query);

      expect(result.items).toHaveLength(3);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should return hasMore=true when results exceed limit', async () => {
      const crafts = Array.from({ length: 11 }, (_, i) =>
        mockCraft({
          id: `c${i}`,
          created_at: new Date(`2025-01-${String(15 - i).padStart(2, '0')}T10:00:00Z`),
        }),
      );

      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(crafts),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ limit: 10 });

      expect(result.items).toHaveLength(10);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('2025-01-06T10:00:00.000Z');
    });

    it('should filter by category_id', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ limit: 10, category_id: 'category-uuid-1' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'craft.category_id = :category_id',
        { category_id: 'category-uuid-1' },
      );
    });

    it('should apply cursor filter when cursor is provided', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({
        limit: 10,
        cursor: '2025-01-15T10:00:00.000Z',
      });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'craft.created_at < :cursorDate',
        { cursorDate: new Date('2025-01-15T10:00:00.000Z') },
      );
    });

    it('should filter by status when status is provided', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ limit: 10, status: CraftStatus.DRAFT });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'craft.status = :status',
        { status: CraftStatus.DRAFT },
      );
    });

    it('should default to PUBLISHED status when no status provided', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ limit: 10 });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'craft.status = :status',
        { status: CraftStatus.PUBLISHED },
      );
    });

    it('should return empty items for no results', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ limit: 10 });

      expect(result.items).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should handle category_id and cursor together', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({
        limit: 10,
        category_id: 'cat-1',
        cursor: '2025-01-15T10:00:00.000Z',
      });

      // Should have been called with both filters
      expect(qb.andWhere).toHaveBeenCalledTimes(3); // status + category + cursor
    });

    it('should return exactly limit items when hasMore is false', async () => {
      const crafts = [mockCraft({ id: 'c1' }), mockCraft({ id: 'c2' })];

      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(crafts),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return craft detail with category relation', async () => {
      const craft = mockCraft({ id: 'craft-uuid-1' });
      craftRepo.findOne.mockResolvedValue(craft);

      const result = await service.findOne('craft-uuid-1');

      expect(result).toEqual(craft);
      expect(craftRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'craft-uuid-1' },
        relations: ['category'],
      });
    });

    it('should throw NotFoundException when craft not found', async () => {
      craftRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when craft is soft deleted', async () => {
      const craft = mockCraft({
        id: 'craft-uuid-1',
        deleted_at: new Date(),
      });
      craftRepo.findOne.mockResolvedValue(craft);

      await expect(service.findOne('craft-uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('search', () => {
    it('should search crafts by keyword with ILIKE matching', async () => {
      const crafts = [mockCraft({ id: 'c1' })];
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(crafts),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const dto: CraftSearchDto = { keyword: '编织' };
      const result = await service.search(dto);

      expect(result.items).toHaveLength(1);
      expect(qb.andWhere).toHaveBeenCalledWith(
        '(craft.title ILIKE :keyword OR craft.description ILIKE :keyword)',
        { keyword: '%编织%' },
      );
    });

    it('should return empty results when no matches', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const dto: CraftSearchDto = { keyword: '不存在' };
      const result = await service.search(dto);

      expect(result.items).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });

    it('should support cursor pagination in search', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const dto: CraftSearchDto = {
        keyword: '编织',
        cursor: '2025-01-15T10:00:00.000Z',
        limit: 20,
      };
      await service.search(dto);

      expect(qb.andWhere).toHaveBeenCalledWith(
        'craft.created_at < :cursorDate',
        { cursorDate: new Date('2025-01-15T10:00:00.000Z') },
      );
    });

    it('should return hasMore=true when search results exceed limit', async () => {
      const crafts = Array.from({ length: 11 }, (_, i) =>
        mockCraft({
          id: `c${i}`,
          created_at: new Date(`2025-01-${String(15 - i).padStart(2, '0')}T10:00:00Z`),
        }),
      );

      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(crafts),
      };
      craftRepo.createQueryBuilder.mockReturnValue(qb);

      const dto: CraftSearchDto = { keyword: '编织', limit: 10 };
      const result = await service.search(dto);

      expect(result.items).toHaveLength(10);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).not.toBeNull();
    });
  });

  describe('findCategories', () => {
    it('should return categories with craft counts', async () => {
      const rawResults = [
        {
          id: 'cat-1',
          name: '编织',
          icon: 'icon-1',
          sort_order: 0,
          created_at: new Date('2025-01-01'),
          craft_count: '3',
        },
        {
          id: 'cat-2',
          name: '木工',
          icon: 'icon-2',
          sort_order: 1,
          created_at: new Date('2025-01-02'),
          craft_count: '0',
        },
      ];

      const qb = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(rawResults),
      };
      categoryRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findCategories();

      expect(result).toHaveLength(2);
      expect(result[0].craft_count).toBe(3);
      expect(result[1].craft_count).toBe(0);
      expect(result[0].name).toBe('编织');
    });

    it('should return empty array when no categories exist', async () => {
      const qb = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      categoryRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findCategories();

      expect(result).toHaveLength(0);
    });

    it('should parse craft_count as integer', async () => {
      const rawResults = [
        {
          id: 'cat-1',
          name: '编织',
          icon: 'icon-1',
          sort_order: 0,
          created_at: new Date('2025-01-01'),
          craft_count: '5',
        },
      ];

      const qb = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(rawResults),
      };
      categoryRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findCategories();

      expect(result[0].craft_count).toBe(5);
      expect(typeof result[0].craft_count).toBe('number');
    });

    it('should handle null craft_count', async () => {
      const rawResults = [
        {
          id: 'cat-1',
          name: '编织',
          icon: null,
          sort_order: 0,
          created_at: new Date('2025-01-01'),
          craft_count: null,
        },
      ];

      const qb = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(rawResults),
      };
      categoryRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findCategories();

      expect(result[0].craft_count).toBe(0);
    });
  });
});