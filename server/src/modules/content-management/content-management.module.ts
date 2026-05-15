import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Craft } from '@/entities/craft.entity';
import { Category } from '@/entities/category.entity';
import { StorageModule } from '@/storage/storage.module';
import { ContentManagementService } from './content-management.service';
import { ContentManagementController } from './content-management.controller';

/**
 * 内容管理模块
 * 负责作品CRUD、图片/视频上传、排序、分类管理、批量操作
 */
@Module({
  imports: [TypeOrmModule.forFeature([Craft, Category]), StorageModule],
  controllers: [ContentManagementController],
  providers: [ContentManagementService],
})
export class ContentManagementModule {}
