import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/** AI 功能类型——每类功能有独立的提示词模板和模型配置 */
export enum AIFeature {
  DESCRIPTION = 'description',
  TAGS = 'tags',
  IMAGE_SUGGESTION = 'image_suggestion',
}

/** AI 配置——按功能维度存储 AI 调用参数（提示词模板、模型、温度等） */
@Entity('ai_configs')
export class AIConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'enum', enum: AIFeature, unique: true })
  feature: AIFeature;

  @Column({ type: 'text', nullable: true })
  prompt_template: string;

  @Column({ default: 'gpt-4o-mini' })
  model: string;

  @Column({ type: 'float', default: 0.7 })
  temperature: number;

  @Column({ default: false })
  is_enabled: boolean;

  @UpdateDateColumn()
  updated_at: Date;
}
