import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryShowcaseController } from './category-showcase.controller';
import { CraftShowcaseService } from './craft-showcase.service';
import { Craft, CraftStatus } from '@/entities/craft.entity';
import { Category } from '@/entities/category.entity';

describe('CategoryShowcaseController', () => {
  let controller: CategoryShowcaseController;
  let service: CraftShowcaseService;

  const mockCategories = [
    {
      id: 'cat-1',
      name: '编织',
      icon: 'icon-1',
      sort_order: 0,
      created_at: new Date('2025-01-01'),
      craft_count: 3,
    },
    {
      id: 'cat-2',
      name: '木工',
      icon: 'icon-2',
      sort_order: 1,
      created_at: new Date('2025-01-02'),
      craft_count: 0,
    },
    {
      id: 'cat-3',
      name: '陶艺',
      icon: 'icon-3',
      sort_order: 2,
      created_at: new Date('2025-01-03'),
      craft_count: 5,
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryShowcaseController],
      providers: [
        CraftShowcaseService,
        {
          provide: getRepositoryToken(Craft),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryShowcaseController>(
      CategoryShowcaseController,
    );
    service = module.get<CraftShowcaseService>(CraftShowcaseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return categories with craft counts', async () => {
      jest
        .spyOn(service, 'findCategories')
        .mockResolvedValue(mockCategories);

      const result = await controller.findAll();

      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(3);
      expect(service.findCategories).toHaveBeenCalledTimes(1);
    });

    it('should return categories sorted by sort_order', async () => {
      jest
        .spyOn(service, 'findCategories')
        .mockResolvedValue(mockCategories);

      const result = await controller.findAll();

      expect(result[0].sort_order).toBe(0);
      expect(result[1].sort_order).toBe(1);
      expect(result[2].sort_order).toBe(2);
    });

    it('should return empty array when no categories', async () => {
      jest.spyOn(service, 'findCategories').mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toHaveLength(0);
    });

    it('should return craft_count as number for each category', async () => {
      jest
        .spyOn(service, 'findCategories')
        .mockResolvedValue(mockCategories);

      const result = await controller.findAll();

      for (const cat of result) {
        expect(typeof cat.craft_count).toBe('number');
      }
    });

    it('should handle categories with zero crafts', async () => {
      jest
        .spyOn(service, 'findCategories')
        .mockResolvedValue([mockCategories[1]]); // 木工 with 0 crafts

      const result = await controller.findAll();

      expect(result[0].craft_count).toBe(0);
      expect(result[0].name).toBe('木工');
    });
  });
});