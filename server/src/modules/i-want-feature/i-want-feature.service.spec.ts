import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IWantFeatureService } from './i-want-feature.service';
import { Intent, IntentType, IntentStatus } from '@/entities/intent.entity';
import { Craft } from '@/entities/craft.entity';
import { User, UserRole } from '@/entities/user.entity';
import { CreateIntentDto } from './dto/create-intent.dto';
import { IntentQueryDto } from './dto/intent-query.dto';
import { UpdateIntentStatusDto } from './dto/update-intent-status.dto';

describe('IWantFeatureService', () => {
  let service: IWantFeatureService;
  let intentRepo: Record<string, jest.Mock>;
  let craftRepo: Record<string, jest.Mock>;
  let userRepo: Record<string, jest.Mock>;

  const mockCraft = (overrides: Partial<Craft> = {}): Craft =>
    ({
      id: 'craft-uuid-1',
      title: '手工编织花篮',
      category_id: 'cat-1',
      intent_count: 5,
      deleted_at: null,
      ...overrides,
    }) as unknown as Craft;

  const mockUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-uuid-1',
      openid: 'wx-openid-123',
      nickname: '手作爱好者',
      avatar_url: null,
      has_profile: false,
      role: UserRole.VISITOR,
      ...overrides,
    }) as unknown as User;

  const mockIntent = (overrides: Partial<Intent> = {}): Intent => ({
    id: 'intent-uuid-1',
    craft_id: 'craft-uuid-1',
    craft: mockCraft(),
    type: IntentType.WANT_COLLECT,
    message: '请问这个作品还在吗？',
    visitor_name: '手作爱好者',
    visitor_contact: 'wechat:abc123',
    status: IntentStatus.PENDING,
    visitor_id: 'user-uuid-1',
    created_at: new Date('2025-01-15T10:00:00Z'),
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    intentRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };

    craftRepo = {
      findOne: jest.fn(),
      increment: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IWantFeatureService,
        {
          provide: getRepositoryToken(Intent),
          useValue: intentRepo,
        },
        {
          provide: getRepositoryToken(Craft),
          useValue: craftRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
      ],
    }).compile();

    service = module.get<IWantFeatureService>(IWantFeatureService);
  });

  describe('createIntent', () => {
    const craftId = 'craft-uuid-1';
    const userId = 'user-uuid-1';
    const dto: CreateIntentDto = {
      type: IntentType.WANT_COLLECT,
      message: '请问这个作品还在吗？',
      visitor_contact: 'wechat:abc123',
    };

    it('should create a new intent', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());
      intentRepo.findOne.mockResolvedValue(null); // no duplicate
      userRepo.findOne.mockResolvedValue(mockUser());

      const intent = mockIntent();
      intentRepo.create.mockReturnValue(intent);
      intentRepo.save.mockResolvedValue(intent);

      const result = await service.createIntent(craftId, userId, dto);

      expect(result.type).toBe(IntentType.WANT_COLLECT);
      expect(result.status).toBe(IntentStatus.PENDING);
      expect(result.visitor_name).toBe('手作爱好者');
      expect(intentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          craft_id: craftId,
          type: IntentType.WANT_COLLECT,
          status: IntentStatus.PENDING,
          visitor_id: userId,
        }),
      );
      expect(craftRepo.increment).toHaveBeenCalledWith(
        { id: craftId },
        'intent_count',
        1,
      );
    });

    it('should throw NotFoundException when craft not found', async () => {
      craftRepo.findOne.mockResolvedValue(null);

      await expect(service.createIntent(craftId, userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on duplicate intent', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());
      intentRepo.findOne.mockResolvedValue(mockIntent());
      userRepo.findOne.mockResolvedValue(mockUser());

      await expect(service.createIntent(craftId, userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());
      intentRepo.findOne.mockResolvedValue(null);
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.createIntent(craftId, userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create intent with optional message undefined', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());
      intentRepo.findOne.mockResolvedValue(null);
      userRepo.findOne.mockResolvedValue(mockUser());

      const dtoWithoutMessage: CreateIntentDto = {
        type: IntentType.WANT_KNOW_MORE,
      };

      const intent = mockIntent({
        type: IntentType.WANT_KNOW_MORE,
        message: null,
        visitor_contact: null,
      });
      intentRepo.create.mockReturnValue(intent);
      intentRepo.save.mockResolvedValue(intent);

      const result = await service.createIntent(
        craftId,
        userId,
        dtoWithoutMessage,
      );

      expect(result.type).toBe(IntentType.WANT_KNOW_MORE);
    });

    it('should support all intent types', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());
      intentRepo.findOne.mockResolvedValue(null);
      userRepo.findOne.mockResolvedValue(mockUser());

      for (const type of [
        IntentType.WANT_COLLECT,
        IntentType.WANT_CUSTOM,
        IntentType.WANT_KNOW_MORE,
      ]) {
        const typeDto: CreateIntentDto = { type };
        const intent = mockIntent({ type });
        intentRepo.create.mockReturnValue(intent);
        intentRepo.save.mockResolvedValue(intent);

        const result = await service.createIntent(craftId, userId, typeDto);
        expect(result.type).toBe(type);
      }
    });
  });

  describe('findIntents', () => {
    it('should return intents with cursor pagination', async () => {
      const intents = [
        mockIntent({ id: 'i1', created_at: new Date('2025-01-15T10:00:00Z') }),
        mockIntent({ id: 'i2', created_at: new Date('2025-01-14T10:00:00Z') }),
      ];

      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(intents),
      };
      intentRepo.createQueryBuilder.mockReturnValue(qb);

      const query: IntentQueryDto = {};
      const result = await service.findIntents(query);

      expect(result.items).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it('should filter by type', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      intentRepo.createQueryBuilder.mockReturnValue(qb);

      const query: IntentQueryDto = { type: IntentType.WANT_COLLECT };
      await service.findIntents(query);

      expect(qb.andWhere).toHaveBeenCalledWith('intent.type = :type', {
        type: IntentType.WANT_COLLECT,
      });
    });

    it('should filter by status', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      intentRepo.createQueryBuilder.mockReturnValue(qb);

      const query: IntentQueryDto = { status: IntentStatus.PENDING };
      await service.findIntents(query);

      expect(qb.andWhere).toHaveBeenCalledWith('intent.status = :status', {
        status: IntentStatus.PENDING,
      });
    });

    it('should filter by both type and status', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      intentRepo.createQueryBuilder.mockReturnValue(qb);

      const query: IntentQueryDto = {
        type: IntentType.WANT_COLLECT,
        status: IntentStatus.PENDING,
      };
      await service.findIntents(query);

      expect(qb.andWhere).toHaveBeenCalledTimes(2);
    });

    it('should apply cursor when provided', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      intentRepo.createQueryBuilder.mockReturnValue(qb);

      const query: IntentQueryDto = {
        cursor: '2025-01-15T10:00:00.000Z',
      };
      await service.findIntents(query);

      expect(qb.andWhere).toHaveBeenCalledWith('intent.created_at < :cursor', {
        cursor: new Date('2025-01-15T10:00:00.000Z'),
      });
    });

    it('should return hasMore=true when results exceed limit', async () => {
      const intents = Array.from({ length: 21 }, (_, i) =>
        mockIntent({
          id: `i${i}`,
          created_at: new Date(
            `2025-01-${String(15 - Math.floor(i / 2)).padStart(2, '0')}T10:00:00Z`,
          ),
        }),
      );

      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(intents),
      };
      intentRepo.createQueryBuilder.mockReturnValue(qb);

      const query: IntentQueryDto = { limit: 20 };
      const result = await service.findIntents(query);

      expect(result.items).toHaveLength(20);
      expect(result.hasMore).toBe(true);
    });

    it('should return empty list when no intents exist', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      intentRepo.createQueryBuilder.mockReturnValue(qb);

      const query: IntentQueryDto = {};
      const result = await service.findIntents(query);

      expect(result.items).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update intent status to VIEWED', async () => {
      const intent = mockIntent({ status: IntentStatus.PENDING });
      intentRepo.findOne.mockResolvedValue(intent);
      const updated = { ...intent, status: IntentStatus.VIEWED };
      intentRepo.save.mockResolvedValue(updated);

      const dto: UpdateIntentStatusDto = { status: IntentStatus.VIEWED };
      const result = await service.updateStatus('intent-uuid-1', dto);

      expect(result.status).toBe(IntentStatus.VIEWED);
      expect(intentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: IntentStatus.VIEWED }),
      );
    });

    it('should update intent status to REPLIED', async () => {
      const intent = mockIntent({ status: IntentStatus.VIEWED });
      intentRepo.findOne.mockResolvedValue(intent);
      const updated = { ...intent, status: IntentStatus.REPLIED };
      intentRepo.save.mockResolvedValue(updated);

      const dto: UpdateIntentStatusDto = { status: IntentStatus.REPLIED };
      const result = await service.updateStatus('intent-uuid-1', dto);

      expect(result.status).toBe(IntentStatus.REPLIED);
    });

    it('should throw NotFoundException when intent not found', async () => {
      intentRepo.findOne.mockResolvedValue(null);

      const dto: UpdateIntentStatusDto = { status: IntentStatus.VIEWED };
      await expect(service.updateStatus('non-existent', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStats', () => {
    it('should return statistics with all fields', async () => {
      intentRepo.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(30); // pending

      const byTypeResults = [
        { type: IntentType.WANT_COLLECT, count: '50' },
        { type: IntentType.WANT_CUSTOM, count: '30' },
        { type: IntentType.WANT_KNOW_MORE, count: '20' },
      ];
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(byTypeResults),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(5), // todayNew
      };
      intentRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getStats();

      expect(result.total).toBe(100);
      expect(result.todayNew).toBe(5);
      expect(result.pending).toBe(30);
      expect(result.byType.want_collect).toBe(50);
      expect(result.byType.want_custom).toBe(30);
      expect(result.byType.want_know_more).toBe(20);
    });

    it('should default type counts to 0 for missing types', async () => {
      intentRepo.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };
      intentRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getStats();

      expect(result.byType.want_collect).toBe(0);
      expect(result.byType.want_custom).toBe(0);
      expect(result.byType.want_know_more).toBe(0);
    });

    it('should handle partial byType results', async () => {
      intentRepo.count.mockResolvedValueOnce(10).mockResolvedValueOnce(5);

      const byTypeResults = [{ type: IntentType.WANT_COLLECT, count: '10' }];
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(byTypeResults),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      };
      intentRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getStats();

      expect(result.byType.want_collect).toBe(10);
      expect(result.byType.want_custom).toBe(0);
      expect(result.byType.want_know_more).toBe(0);
    });

    it('should calculate todayNew correctly', async () => {
      intentRepo.count.mockResolvedValueOnce(50).mockResolvedValueOnce(10);

      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3),
      };
      intentRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getStats();

      expect(result.todayNew).toBe(3);
      // Verify today date was used in query
      expect(qb.where).toHaveBeenCalledWith(
        'intent.created_at >= :today',
        expect.objectContaining({ today: expect.any(Date) }),
      );
    });
  });
});
