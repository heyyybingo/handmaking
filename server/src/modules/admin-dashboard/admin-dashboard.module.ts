import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Craft } from '@/entities/craft.entity';
import { Comment } from '@/entities/comment.entity';
import { Intent } from '@/entities/intent.entity';
import { User } from '@/entities/user.entity';
import { SystemConfig } from '@/entities/system-config.entity';
import { AdminDashboardService } from './admin-dashboard.service';
import {
  AdminDashboardController,
  AdminConfigController,
} from './admin-dashboard.controller';

/**
 * 管理后台模块
 * 负责数据概览、评论管理、系统配置、AI配置面板等后台功能
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Craft, Comment, Intent, User, SystemConfig]),
  ],
  controllers: [AdminDashboardController, AdminConfigController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}
