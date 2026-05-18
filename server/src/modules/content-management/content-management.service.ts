import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Craft, CraftStatus } from '@/entities/craft.entity';
import { Category } from '@/entities/category.entity';
import type { IStorageService } from '@/storage/storage.interface';
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
import { CraftQueryDto } from '../craft-showcase/dto';

/**
 * 内容管理服务
 * 负责作品CRUD、分类管理、文件上传、批量操作
 */
@Injectable()
export class ContentManagementService {
  private readonly logger = new Logger(ContentManagementService.name);

  constructor(
    @InjectRepository(Craft)
    private readonly craftRepo: Repository<Craft>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
  ) {}

  // ── 作品方法 ──

  /**
   * 创建作品
   */
  async createCraft(dto: CreateCraftDto): Promise<Craft> {
    const craft = this.craftRepo.create({
      title: dto.title,
      description: dto.description,
      images: dto.images,
      video: dto.video,
      category_id: dto.category_id,
      tags: dto.tags,
      status: dto.status ?? CraftStatus.DRAFT,
      sort_order: dto.sort_order ?? 0,
    });
    return this.craftRepo.save(craft);
  }

  /**
   * 更新作品
   */
  async updateCraft(id: string, dto: UpdateCraftDto): Promise<Craft> {
    const craft = await this.craftRepo.findOne({ where: { id } });
    if (!craft || craft.deleted_at) {
      throw new NotFoundException(`作品 #${id} 不存在`);
    }

    Object.assign(craft, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.images !== undefined && { images: dto.images }),
      ...(dto.video !== undefined && { video: dto.video }),
      ...(dto.category_id !== undefined && { category_id: dto.category_id }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
    });

    return this.craftRepo.save(craft);
  }

  /**
   * 软删除作品
   */
  async deleteCraft(id: string): Promise<void> {
    const craft = await this.craftRepo.findOne({ where: { id } });
    if (!craft || craft.deleted_at) {
      throw new NotFoundException(`作品 #${id} 不存在`);
    }

    craft.deleted_at = new Date();
    await this.craftRepo.save(craft);
  }

  /**
   * 管理端作品列表（包含所有状态）
   */
  async findAdminCrafts(query: CraftQueryDto) {
    const { cursor, limit, category_id, status } = query;

    const qb = this.craftRepo
      .createQueryBuilder('craft')
      .leftJoinAndSelect('craft.category', 'category')
      .where('craft.deleted_at IS NULL');

    if (status) {
      qb.andWhere('craft.status = :status', { status });
    }

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
   * 批量操作
   */
  async batchOperation(dto: BatchActionDto): Promise<void> {
    const { ids, action, category_id } = dto;

    if (action === BatchAction.MOVE_CATEGORY && !category_id) {
      throw new BadRequestException('move_category操作必须提供category_id');
    }

    const crafts = await this.craftRepo
      .createQueryBuilder('craft')
      .where('craft.id IN (:...ids)', { ids })
      .andWhere('craft.deleted_at IS NULL')
      .getMany();

    if (crafts.length === 0) {
      throw new NotFoundException('未找到指定作品');
    }

    const validIds = crafts.map((c) => c.id);

    switch (action) {
      case BatchAction.PUBLISH:
        await this.craftRepo.update(validIds, {
          status: CraftStatus.PUBLISHED,
        });
        break;
      case BatchAction.UNPUBLISH:
        await this.craftRepo.update(validIds, { status: CraftStatus.DRAFT });
        break;
      case BatchAction.ARCHIVE:
        await this.craftRepo.update(validIds, { status: CraftStatus.ARCHIVED });
        break;
      case BatchAction.DELETE:
        await this.craftRepo.update(validIds, { deleted_at: new Date() });
        break;
      case BatchAction.MOVE_CATEGORY:
        await this.craftRepo.update(validIds, { category_id });
        break;
    }
  }

  // ── 分类方法 ──

  /**
   * 创建分类
   */
  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepo.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new BadRequestException(`分类"${dto.name}"已存在`);
    }

    const category = this.categoryRepo.create({
      name: dto.name,
      icon: dto.icon,
      sort_order: dto.sort_order ?? 0,
    });
    return this.categoryRepo.save(category);
  }

  /**
   * 更新分类
   */
  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`分类 #${id} 不存在`);
    }

    Object.assign(category, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.icon !== undefined && { icon: dto.icon }),
      ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
    });

    return this.categoryRepo.save(category);
  }

  /**
   * 删除分类（需检查是否有作品引用）
   */
  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`分类 #${id} 不存在`);
    }

    const craftCount = await this.craftRepo
      .createQueryBuilder('craft')
      .where('craft.category_id = :categoryId', { categoryId: id })
      .andWhere('craft.deleted_at IS NULL')
      .getCount();

    if (craftCount > 0) {
      throw new BadRequestException(
        `该分类下还有${craftCount}个作品，无法删除`,
      );
    }

    await this.categoryRepo.remove(category);
  }

  /**
   * 查询所有分类（按sort_order排序）
   */
  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepo.find({
      order: { sort_order: 'ASC' },
    });
  }

  /**
   * 重新排序分类
   */
  async reorderCategories(ids: string[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      await this.categoryRepo.update(ids[i], { sort_order: i });
    }
  }

  // ── 文件方法 ──

  /**
   * 获取预签名上传URL
   */
  async getPresignedUrl(
    dto: PresignDto,
  ): Promise<{ url: string; key: string }> {
    const { filename, fileType } = dto;
    const prefix =
      fileType === FileType.IMAGE ? 'crafts/images' : 'crafts/videos';
    const key = `${prefix}/${randomUUID()}/${filename}`;

    const url = await this.storageService.getPresignedUrl(key, 'upload');
    return { url, key };
  }

  /**
   * 确认上传完成
   */
  async confirmUpload(dto: ConfirmUploadDto): Promise<{ url: string }> {
    const { key } = dto;

    await this.storageService.confirmUpload(key);

    // 如果是图片，生成缩略图
    const isImage = key.startsWith('crafts/images');
    if (isImage) {
      await this.storageService.generateThumbnails(key);
    }

    const url = this.storageService.getFileUrl(key);
    return { url };
  }
}
