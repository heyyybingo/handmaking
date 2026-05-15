import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AIFeature {
  DESCRIPTION = 'description',
  TAGS = 'tags',
  IMAGE_SUGGESTION = 'image_suggestion',
}

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
