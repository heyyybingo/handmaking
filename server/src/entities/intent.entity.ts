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

/** 意向类型——"我想要"功能的三种意向 */
export enum IntentType {
  WANT_COLLECT = 'want_collect',
  WANT_CUSTOM = 'want_custom',
  WANT_KNOW_MORE = 'want_know_more',
}

/** 意向处理状态 */
export enum IntentStatus {
  PENDING = 'pending',
  VIEWED = 'viewed',
  REPLIED = 'replied',
}

/** "我想要"意向——访客对作品表达兴趣的记录，管理员可在后台查看并处理 */
@Entity('intents')
export class Intent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  craft_id: string;

  @ManyToOne(() => Craft)
  @JoinColumn({ name: 'craft_id' })
  craft: Craft;

  @Column({ type: 'enum', enum: IntentType })
  type: IntentType;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ length: 30, nullable: true })
  visitor_name: string;

  @Column({ length: 100, nullable: true })
  visitor_contact: string;

  @Index()
  @Column({ type: 'enum', enum: IntentStatus, default: IntentStatus.PENDING })
  status: IntentStatus;

  @Column({ type: 'uuid', nullable: true })
  visitor_id: string;

  @CreateDateColumn()
  created_at: Date;
}
