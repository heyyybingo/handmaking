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

export enum CraftStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('crafts')
export class Craft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  images: { url: string; thumbnailUrl: string; width: number; height: number; sort: number }[];

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

  @Column({ default: 0 })
  like_count: number;

  @Column({ default: 0 })
  comment_count: number;

  @Column({ default: 0 })
  intent_count: number;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
