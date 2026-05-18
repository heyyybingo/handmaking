import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';

/** 作品状态 */
export enum CraftStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/** 手工作品——展示平台的核心实体，记录作品的基本信息、媒体资源和交互计数 */
@Entity('crafts')
export class Craft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  /** 作品图片列表，按 sort 字段排序展示 */
  @Column({ type: 'jsonb', nullable: true })
  images: {
    url: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    sort: number;
  }[];

  /** 作品视频（可选），最多一个 */
  @Column({ type: 'jsonb', nullable: true })
  video: { url: string; coverUrl: string; duration: number };

  @Index()
  @Column({ type: 'uuid' })
  category_id: string;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Index()
  @Column({ type: 'enum', enum: CraftStatus, default: CraftStatus.DRAFT })
  status: CraftStatus;

  /** 点赞数（Redis 计数器定期回写，不保证实时精确） */
  @Column({ default: 0 })
  like_count: number;

  /** 评论数（Redis 计数器定期回写，不保证实时精确） */
  @Column({ default: 0 })
  comment_count: number;

  /** "我想要"意向数（Redis 计数器定期回写，不保证实时精确） */
  @Column({ default: 0 })
  intent_count: number;

  @Column({ default: 0 })
  sort_order: number;

  /** 软删除标记，非空表示已删除 */
  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
