import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Craft, CraftStatus } from '@/entities/craft.entity';
import { Comment } from '@/entities/comment.entity';
import { Intent } from '@/entities/intent.entity';
import { User } from '@/entities/user.entity';
import { SystemConfig } from '@/entities/system-config.entity';
import { UpdateSystemConfigDto } from './dto';

export interface TrendPoint {
  date: string;
  value: number;
}

export interface DashboardStats {
  totalCrafts: number;
  totalLikes: number;
  totalComments: number;
  totalIntents: number;
  todayVisitors: number;
  trends: {
    totalCrafts: TrendPoint[];
    totalLikes: TrendPoint[];
    totalComments: TrendPoint[];
    totalIntents: TrendPoint[];
    todayVisitors: TrendPoint[];
  };
}

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Craft)
    private readonly craftRepo: Repository<Craft>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Intent)
    private readonly intentRepo: Repository<Intent>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Aggregate metrics
    const totalCrafts = await this.craftRepo.count({
      where: { status: CraftStatus.PUBLISHED, deleted_at: IsNull() },
    });

    const likeResult = await this.craftRepo
      .createQueryBuilder('craft')
      .select('COALESCE(SUM(craft.like_count), 0)', 'total')
      .where('craft.deleted_at IS NULL')
      .getRawOne();
    const totalLikes = Number(likeResult?.total ?? 0);

    const totalComments = await this.commentRepo.count();
    const totalIntents = await this.intentRepo.count();

    // Placeholder — would need analytics service for real visitor counts
    const todayVisitors = 0;

    // Build 7-day trend data
    const dateRange = this.buildDateRange(sevenDaysAgo, now);

    const craftsTrend = await this.buildCraftsTrend(
      sevenDaysAgo,
      now,
      dateRange,
    );

    const likesTrend = await this.buildLikesTrend(
      sevenDaysAgo,
      now,
      dateRange,
    );

    const commentsTrend = await this.buildCountTrend(
      this.commentRepo,
      'created_at',
      sevenDaysAgo,
      now,
      dateRange,
    );

    const intentsTrend = await this.buildCountTrend(
      this.intentRepo,
      'created_at',
      sevenDaysAgo,
      now,
      dateRange,
    );

    const visitorsTrend: TrendPoint[] = dateRange.map((date) => ({
      date,
      value: 0,
    }));

    return {
      totalCrafts,
      totalLikes,
      totalComments,
      totalIntents,
      todayVisitors,
      trends: {
        totalCrafts: craftsTrend,
        totalLikes: likesTrend,
        totalComments: commentsTrend,
        totalIntents: intentsTrend,
        todayVisitors: visitorsTrend,
      },
    };
  }

  async getAllConfigs(): Promise<Record<string, string>> {
    const configs = await this.configRepo.find();
    const result: Record<string, string> = {};
    for (const config of configs) {
      result[config.key] = config.value ?? '';
    }
    return result;
  }

  async updateConfigs(dto: UpdateSystemConfigDto): Promise<Record<string, string>> {
    for (const item of dto.configs) {
      await this.configRepo.upsert(
        { key: item.key, value: item.value },
        ['key'],
      );
    }
    return this.getAllConfigs();
  }

  /**
   * Build an array of date strings (YYYY-MM-DD) covering the range
   */
  private buildDateRange(start: Date, end: Date): string[] {
    const dates: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  /**
   * Build trend data for published non-deleted crafts by day.
   */
  private async buildCraftsTrend(
    startDate: Date,
    endDate: Date,
    dateRange: string[],
  ): Promise<TrendPoint[]> {
    const rows = await this.craftRepo
      .createQueryBuilder('craft')
      .select('DATE(craft.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('craft.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .andWhere('craft.status = :status', { status: CraftStatus.PUBLISHED })
      .andWhere('craft.deleted_at IS NULL')
      .groupBy('DATE(craft.created_at)')
      .orderBy('DATE(craft.created_at)', 'ASC')
      .getRawMany();

    return this.mapTrendRows(rows, dateRange, 'count');
  }

  /**
   * Build trend data for likes (sum of like_count) by day across non-deleted crafts.
   */
  private async buildLikesTrend(
    startDate: Date,
    endDate: Date,
    dateRange: string[],
  ): Promise<TrendPoint[]> {
    const rows = await this.craftRepo
      .createQueryBuilder('craft')
      .select('DATE(craft.created_at)', 'date')
      .addSelect('COALESCE(SUM(craft.like_count), 0)', 'total')
      .where('craft.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .andWhere('craft.deleted_at IS NULL')
      .groupBy('DATE(craft.created_at)')
      .orderBy('DATE(craft.created_at)', 'ASC')
      .getRawMany();

    return this.mapTrendRows(rows, dateRange, 'total');
  }

  /**
   * Build trend data by counting rows per day in the date range.
   */
  private async buildCountTrend(
    repo: Repository<Comment | Intent>,
    dateColumn: string,
    startDate: Date,
    endDate: Date,
    dateRange: string[],
  ): Promise<TrendPoint[]> {
    const alias = 'e';
    const rows = await repo
      .createQueryBuilder(alias)
      .select(`DATE(${alias}.${dateColumn})`, 'date')
      .addSelect('COUNT(*)', 'count')
      .where(`${alias}.${dateColumn} BETWEEN :start AND :end`, {
        start: startDate,
        end: endDate,
      })
      .groupBy(`DATE(${alias}.${dateColumn})`)
      .orderBy(`DATE(${alias}.${dateColumn})`, 'ASC')
      .getRawMany();

    return this.mapTrendRows(rows, dateRange, 'count');
  }

  /**
   * Map raw query rows to TrendPoint[], filling in zero for missing dates.
   */
  private mapTrendRows(
    rows: Record<string, unknown>[],
    dateRange: string[],
    valueKey: string,
  ): TrendPoint[] {
    const map = new Map<string, number>();
    for (const row of rows) {
      const date =
        row.date instanceof Date
          ? row.date.toISOString().slice(0, 10)
          : String(row.date);
      map.set(date, Number(row[valueKey]));
    }

    return dateRange.map((date) => ({
      date,
      value: map.get(date) ?? 0,
    }));
  }
}
