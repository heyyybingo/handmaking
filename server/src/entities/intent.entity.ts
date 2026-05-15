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

export enum IntentType {
  WANT_COLLECT = 'want_collect',
  WANT_CUSTOM = 'want_custom',
  WANT_KNOW_MORE = 'want_know_more',
}

export enum IntentStatus {
  PENDING = 'pending',
  VIEWED = 'viewed',
  REPLIED = 'replied',
}

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
