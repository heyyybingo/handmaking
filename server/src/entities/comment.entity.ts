import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Craft } from './craft.entity';

export enum AuthorType {
  ADMIN = 'admin',
  VISITOR = 'visitor',
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  craft_id: string;

  @ManyToOne(() => Craft)
  @JoinColumn({ name: 'craft_id' })
  craft: Craft;

  @Column({ type: 'uuid', nullable: true })
  parent_id: string;

  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: AuthorType })
  author_type: AuthorType;

  @Column({ length: 30 })
  author_name: string;

  @Column({ nullable: true })
  author_avatar: string;

  @Column({ default: false })
  is_author_reply: boolean;

  @Column({ type: 'uuid', nullable: true })
  author_id: string;

  @CreateDateColumn()
  created_at: Date;
}
