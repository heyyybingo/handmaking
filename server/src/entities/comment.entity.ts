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

/** 评论作者类型——区分管理员（作者）回复和访客评论 */
export enum AuthorType {
  ADMIN = 'admin',
  VISITOR = 'visitor',
}

/** 评论——支持一级评论和回复（通过 parent_id 自关联实现嵌套） */
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

  /** 父评论 ID——为空表示一级评论，非空表示对某条评论的回复 */
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

  /** 是否为作者回复——标记管理员对评论的回复，前端可据此显示特殊样式 */
  @Column({ default: false })
  is_author_reply: boolean;

  @Column({ type: 'uuid', nullable: true })
  author_id: string;

  @CreateDateColumn()
  created_at: Date;
}
