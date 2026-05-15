import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Intent, IntentType, IntentStatus } from '@/entities/intent.entity';
import { Craft } from '@/entities/craft.entity';
import { User } from '@/entities/user.entity';
import { CreateIntentDto } from './dto/create-intent.dto';
import { IntentQueryDto } from './dto/intent-query.dto';
import { UpdateIntentStatusDto } from './dto/update-intent-status.dto';

@Injectable()
export class IWantFeatureService {
  constructor(
    @InjectRepository(Intent)
    private readonly intentRepo: Repository<Intent>,
    @InjectRepository(Craft)
    private readonly craftRepo: Repository<Craft>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * 创建意向
   * 同一访客对同一作品不可重复提交
   */
  async createIntent(
    craftId: string,
    userId: string,
    dto: CreateIntentDto,
  ): Promise<Intent> {
    const craft = await this.craftRepo.findOne({ where: { id: craftId } });
    if (!craft) {
      throw new NotFoundException('作品不存在');
    }

    // 检查重复提交
    const existing = await this.intentRepo.findOne({
      where: {
        craft_id: craftId,
        visitor_id: userId,
      },
    });
    if (existing) {
      throw new BadRequestException('您已对该作品表达过意向');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const intent = this.intentRepo.create({
      craft_id: craftId,
      type: dto.type,
      message: dto.message ?? undefined,
      visitor_name: user.nickname,
      visitor_contact: dto.visitor_contact ?? undefined,
      status: IntentStatus.PENDING,
      visitor_id: userId,
    });

    const saved = await this.intentRepo.save(intent);

    // 递增意向计数
    await this.craftRepo.increment({ id: craftId }, 'intent_count', 1);

    return saved;
  }

  /**
   * 查询意向列表（游标分页，支持类型/状态筛选）
   */
  async findIntents(
    query: IntentQueryDto,
  ): Promise<{ items: Intent[]; nextCursor: string | null; hasMore: boolean }> {
    const limit = query.limit ?? 20;

    const qb = this.intentRepo
      .createQueryBuilder('intent')
      .leftJoinAndSelect('intent.craft', 'craft')
      .orderBy('intent.created_at', 'DESC')
      .take(limit + 1);

    if (query.cursor) {
      qb.andWhere('intent.created_at < :cursor', {
        cursor: new Date(query.cursor!),
      });
    }

    if (query.type) {
      qb.andWhere('intent.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('intent.status = :status', { status: query.status });
    }

    const results = await qb.getMany();
    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    const nextCursor =
      hasMore && items.length > 0
        ? items[items.length - 1].created_at.toISOString()
        : null;

    return { items, nextCursor, hasMore };
  }

  /**
   * 更新意向状态
   */
  async updateStatus(
    id: string,
    dto: UpdateIntentStatusDto,
  ): Promise<Intent> {
    const intent = await this.intentRepo.findOne({ where: { id } });
    if (!intent) {
      throw new NotFoundException('意向不存在');
    }

    intent.status = dto.status;
    return this.intentRepo.save(intent);
  }

  /**
   * 获取意向统计
   */
  async getStats(): Promise<{
    total: number;
    todayNew: number;
    pending: number;
    byType: Record<IntentType, number>;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, pending, byTypeResults] = await Promise.all([
      this.intentRepo.count(),
      this.intentRepo.count({
        where: { status: IntentStatus.PENDING },
      }),
      this.intentRepo
        .createQueryBuilder('intent')
        .select('intent.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('intent.type')
        .getRawMany(),
    ]);

    const byType: Record<IntentType, number> = {
      [IntentType.WANT_COLLECT]: 0,
      [IntentType.WANT_CUSTOM]: 0,
      [IntentType.WANT_KNOW_MORE]: 0,
    };

    for (const row of byTypeResults) {
      if (row.type in byType) {
        byType[row.type as IntentType] = parseInt(row.count, 10);
      }
    }

    // 今日新增使用QueryBuilder精确查询
    const todayNewCount = await this.intentRepo
      .createQueryBuilder('intent')
      .where('intent.created_at >= :today', { today })
      .getCount();

    return {
      total,
      todayNew: todayNewCount,
      pending,
      byType,
    };
  }
}
