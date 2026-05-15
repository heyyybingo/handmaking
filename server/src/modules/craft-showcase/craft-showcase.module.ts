import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Craft } from '@/entities/craft.entity';
import { Category } from '@/entities/category.entity';
import { CraftShowcaseService } from './craft-showcase.service';
import { CraftShowcaseController } from './craft-showcase.controller';
import { CategoryShowcaseController } from './category-showcase.controller';

/**
 * 作品展示模块
 * 负责作品列表、详情、分类、搜索等展示相关功能
 */
@Module({
  imports: [TypeOrmModule.forFeature([Craft, Category])],
  controllers: [CraftShowcaseController, CategoryShowcaseController],
  providers: [CraftShowcaseService],
})
export class CraftShowcaseModule {}
