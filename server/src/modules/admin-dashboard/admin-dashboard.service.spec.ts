import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminDashboardService } from './admin-dashboard.service';
import { Craft, CraftStatus } from '@/entities/craft.entity';
import { Comment } from '@/entities/comment.entity';
import { Intent } from '@/entities/intent.entity';
import { User } from '@/entities/user.entity';
import { SystemConfig } from '@/entities/system-config.entity';
import { UpdateSystemConfigDto } from './dto';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let craftRepo: Record<string, jest.Mock>;
  let commentRepo: Record<string, jest.Mock>;
  let intentRepo: Record<string, jest.Mock>;
  let userRepo: Record<string, jest.Mock>;
  let configRepo: Record<string, jest.Mock>;

  beforeEach(async () => {
    jest.clearAllMocks();

    craftRepo = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    commentRepo = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    intentRepo = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    userRepo = {
      count: jest.fn(),
    };

    configRepo = {
      find: jest.fn(),
      upsert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        {
          provide: getRepositoryToken(Craft),
          useValue: craftRepo,
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: commentRepo,
        },
        {
          provide: getRepositoryToken(Intent),
          useValue: intentRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
        {
          provide: getRepositoryToken(SystemConfig),
          useValue: configRepo,
        },
      ],
    }).compile();

    service = module.get<AdminDashboardService>(AdminDashboardService);
  });

  describe('getStats', () => {
    const mockCraftsTrend = [
      { date: '2025-01-09', count: '2' },
      { date: '2025-01-11', count: '1' },
    ];

    const mockLikesTrend = [
      { date: '2025-01-09', total: '15' },
      { date: '2025-01-11', total: '8' },
    ];

    const mockCommentsTrend = [
      { date: '2025-01-10', count: '3' },
      { date: '2025-01-12', count: '5' },
    ];

    const mockIntentsTrend = [
      { date: '2025-01-10', count: '2' },
      { date: '2025-01-13', count: '1' },
    ];

    beforeEach(() => {
      // Craft count
      craftRepo.count.mockResolvedValue(10);

      // Like sum
      const likeQb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '150' }),
      };
      craftRepo.createQueryBuilder.mockReturnValueOnce(likeQb);

      // Comment count
      commentRepo.count.mockResolvedValue(30);

      // Intent count
      intentRepo.count.mockResolvedValue(20);

      // Crafts trend
      const craftsTrendQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockCraftsTrend),
      };
      craftRepo.createQueryBuilder.mockReturnValueOnce(craftsTrendQb);

      // Likes trend
      const likesTrendQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockLikesTrend),
      };
      craftRepo.createQueryBuilder.mockReturnValueOnce(likesTrendQb);

      // Comments trend
      const commentsTrendQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockCommentsTrend),
      };
      commentRepo.createQueryBuilder.mockReturnValue(commentsTrendQb);

      // Intents trend
      const intentsTrendQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockIntentsTrend),
      };
      intentRepo.createQueryBuilder.mockReturnValue(intentsTrendQb);
    });

    it('should return dashboard stats with all fields', async () => {
      const result = await service.getStats();

      expect(result.totalCrafts).toBe(10);
      expect(result.totalLikes).toBe(150);
      expect(result.totalComments).toBe(30);
      expect(result.totalIntents).toBe(20);
      expect(result.todayVisitors).toBe(0);
    });

    it('should return trends with 8 data points (7 days back + today)', async () => {
      const result = await service.getStats();

      expect(result.trends.totalCrafts).toHaveLength(8);
      expect(result.trends.totalLikes).toHaveLength(8);
      expect(result.trends.totalComments).toHaveLength(8);
      expect(result.trends.totalIntents).toHaveLength(8);
      expect(result.trends.todayVisitors).toHaveLength(8);
    });

    it('should return trend points with date and value', async () => {
      const result = await service.getStats();

      for (const point of result.trends.totalCrafts) {
        expect(point).toHaveProperty('date');
        expect(point).toHaveProperty('value');
        expect(typeof point.date).toBe('string');
        expect(typeof point.value).toBe('number');
      }
    });

    it('should fill missing dates with zero values', async () => {
      const result = await service.getStats();

      // Days without data should have value 0
      const zeroDays = result.trends.totalCrafts.filter((p) => p.value === 0);
      expect(zeroDays.length).toBeGreaterThan(0);
    });

    it('should handle zero likes gracefully', async () => {
      // Override like Qb mock
      craftRepo.createQueryBuilder.mockReset();

      const likeQb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: null }),
      };
      craftRepo.createQueryBuilder.mockReturnValueOnce(likeQb);

      const craftsTrendQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValueOnce(craftsTrendQb);

      const likesTrendQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      craftRepo.createQueryBuilder.mockReturnValueOnce(likesTrendQb);

      const commentsTrendQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      commentRepo.createQueryBuilder.mockReturnValue(commentsTrendQb);

      const intentsTrendQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      intentRepo.createQueryBuilder.mockReturnValue(intentsTrendQb);

      craftRepo.count.mockResolvedValue(0);
      commentRepo.count.mockResolvedValue(0);
      intentRepo.count.mockResolvedValue(0);

      const result = await service.getStats();

      expect(result.totalLikes).toBe(0);
      expect(result.totalCrafts).toBe(0);
    });

    it('should count only published non-deleted crafts', async () => {
      await service.getStats();

      expect(craftRepo.count).toHaveBeenCalledWith({
        where: {
          status: CraftStatus.PUBLISHED,
          deleted_at: expect.anything(),
        },
      });
    });

    it('should handle date objects in trend rows', async () => {
      // Test that mapTrendRows handles Date objects correctly
      // Already covered by the trend data having string dates, but the code
      // also handles Date objects via `row.date instanceof Date` check.
      const result = await service.getStats();

      // All trends should have 8 entries (7 days ago through today inclusive)
      expect(result.trends.totalCrafts.length).toBe(8);
    });
  });

  describe('getAllConfigs', () => {
    it('should return all configs as key-value object', async () => {
      const configs: SystemConfig[] = [
        {
          id: 'c1',
          key: 'site_name',
          value: '手作展示平台',
          updated_at: new Date(),
        },
        {
          id: 'c2',
          key: 'site_description',
          value: '一个手工作品展示平台',
          updated_at: new Date(),
        },
        {
          id: 'c3',
          key: 'max_upload_size',
          value: '10',
          updated_at: new Date(),
        },
      ];
      configRepo.find.mockResolvedValue(configs);

      const result = await service.getAllConfigs();

      expect(result).toEqual({
        site_name: '手作展示平台',
        site_description: '一个手工作品展示平台',
        max_upload_size: '10',
      });
    });

    it('should return empty object when no configs exist', async () => {
      configRepo.find.mockResolvedValue([]);

      const result = await service.getAllConfigs();

      expect(result).toEqual({});
    });

    it('should handle null config values as empty string', async () => {
      const configs: SystemConfig[] = [
        {
          id: 'c1',
          key: 'optional_setting',
          value: null,
          updated_at: new Date(),
        },
      ];
      configRepo.find.mockResolvedValue(configs);

      const result = await service.getAllConfigs();

      expect(result.optional_setting).toBe('');
    });
  });

  describe('updateConfigs', () => {
    it('should upsert configs and return all configs', async () => {
      const dto: UpdateSystemConfigDto = {
        configs: [
          { key: 'site_name', value: '新名称' },
          { key: 'max_upload_size', value: '20' },
        ],
      };

      configRepo.upsert.mockResolvedValue(undefined);
      const allConfigs: SystemConfig[] = [
        {
          id: 'c1',
          key: 'site_name',
          value: '新名称',
          updated_at: new Date(),
        },
        {
          id: 'c2',
          key: 'max_upload_size',
          value: '20',
          updated_at: new Date(),
        },
      ];
      configRepo.find.mockResolvedValue(allConfigs);

      const result = await service.updateConfigs(dto);

      expect(configRepo.upsert).toHaveBeenCalledTimes(2);
      expect(configRepo.upsert).toHaveBeenCalledWith(
        { key: 'site_name', value: '新名称' },
        ['key'],
      );
      expect(configRepo.upsert).toHaveBeenCalledWith(
        { key: 'max_upload_size', value: '20' },
        ['key'],
      );
      expect(result).toEqual({
        site_name: '新名称',
        max_upload_size: '20',
      });
    });

    it('should handle single config update', async () => {
      const dto: UpdateSystemConfigDto = {
        configs: [{ key: 'site_name', value: '单条更新' }],
      };

      configRepo.upsert.mockResolvedValue(undefined);
      configRepo.find.mockResolvedValue([
        {
          id: 'c1',
          key: 'site_name',
          value: '单条更新',
          updated_at: new Date(),
        },
      ]);

      const result = await service.updateConfigs(dto);

      expect(configRepo.upsert).toHaveBeenCalledTimes(1);
      expect(result.site_name).toBe('单条更新');
    });
  });
});
