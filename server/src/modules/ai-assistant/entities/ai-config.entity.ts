import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ai_configs')
export class AiConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'feature', type: 'varchar', length: 50, unique: true })
  feature: string;

  @Column({ name: 'prompt_template', type: 'text' })
  promptTemplate: string;

  @Column({ name: 'model', type: 'varchar', length: 100, default: 'gpt-4' })
  model: string;

  @Column({ name: 'temperature', type: 'decimal', precision: 3, scale: 2, default: 0.7 })
  temperature: number;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
