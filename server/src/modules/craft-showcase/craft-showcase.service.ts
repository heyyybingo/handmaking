import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Craft, CraftStatus } from '@/entities/craft.entity';
import { Category } from '@/entities/category.entity';
import { CraftQueryDto, CraftSearchDto } from './dto';

/**
 * 作品展示服务
 * 负责小程序端的作品列表、详情、搜索、分类查询
 */
@Injectable()
export class CraftShowcaseService {
  constructor(
    @InjectRepository(Craft)
    private readonly craftRepo: Repository<Craft>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  /**
   * 分页查询作品列表（游标分页）
   * 小程序端默认只展示已发布作品
   */
  async findAll(query: CraftQueryDto) {
    const { cursor, limit, category_id, status } = query;
    const effectiveStatus = status ?? CraftStatus.PUBLISHED;

    const qb = this.craftRepo
      .createQueryBuilder('craft')
      .leftJoinAndSelect('craft.category', 'category')
      .where('craft.deleted_at IS NULL')
      .andWhere('craft.status = :status', { status: effectiveStatus });

    if (category_id) {
      qb.andWhere('craft.category_id = :category_id', { category_id });
    }

    if (cursor) {
      qb.andWhere('craft.created_at < :cursorDate', {
        cursorDate: new Date(cursor),
      });
    }

    qb.orderBy('craft.created_at', 'DESC').take(limit + 1);

    const items = await qb.getMany();
    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;

    const nextCursor = hasMore
      ? resultItems[resultItems.length - 1].created_at.toISOString()
      : null;

    return {
      items: resultItems,
      nextCursor,
      hasMore,
    };
  }

  /**
   * 查询单个作品详情
   */
  async findOne(id: string): Promise<Craft> {
    const craft = await this.craftRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!craft || craft.deleted_at) {
      throw new NotFoundException(`作品 #${id} 不存在`);
    }

    return craft;
  }

  /**
   * 搜索作品（ILIKE模糊匹配）
   */
  async search(dto: CraftSearchDto) {
    const { keyword, cursor, limit } = dto;

    const qb = this.craftRepo
      .createQueryBuilder('craft')
      .leftJoinAndSelect('craft.category', 'category')
      .where('craft.deleted_at IS NULL')
      .andWhere('craft.status = :status', { status: CraftStatus.PUBLISHED })
      .andWhere(
        '(craft.title ILIKE :keyword OR craft.description ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );

    if (cursor) {
      qb.andWhere('craft.created_at < :cursorDate', {
        cursorDate: new Date(cursor),
      });
    }

    qb.orderBy('craft.created_at', 'DESC').take(limit + 1);

    const items = await qb.getMany();
    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;

    const nextCursor = hasMore
      ? resultItems[resultItems.length - 1].created_at.toISOString()
      : null;

    return {
      items: resultItems,
      nextCursor,
      hasMore,
    };
  }

  /**
   * 查询所有分类及其下已发布作品数量
   */
  async findCategories() {
    const result = await this.categoryRepo
      .createQueryBuilder('cat')
      .leftJoin(
        'cat.crafts',
        'craft',
        'craft.status = :status AND craft.deleted_at IS NULL',
        { status: CraftStatus.PUBLISHED },
      )
      .select('cat.id', 'id')
      .addSelect('cat.name', 'name')
      .addSelect('cat.icon', 'icon')
      .addSelect('cat.sort_order', 'sort_order')
      .addSelect('cat.created_at', 'created_at')
      .addSelect('COUNT(craft.id)', 'craft_count')
      .groupBy('cat.id')
      .orderBy('cat.sort_order', 'ASC')
      .getRawMany();

    return result.map((row) => ({
      ...row,
      craft_count: parseInt(row.craft_count, 10) || 0,
    }));
  }
}
