import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Craft } from './craft.entity';

/** 作品分类——用于组织手工作品的分类体系，如"编织""陶艺""木工"等 */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  name: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Craft, (craft) => craft.category)
  crafts: Craft[];
}
