import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '@/entities/comment.entity';
import { Craft } from '@/entities/craft.entity';
import { User } from '@/entities/user.entity';
import { UserAuthModule } from '@/modules/user-auth/user-auth.module';
import { SocialInteractionService } from './social-interaction.service';
import { SocialInteractionController } from './social-interaction.controller';

/**
 * 社交互动模块
 * 负责微信分享、点赞、评论、作者回复等社交功能
 */
@Module({
  imports: [TypeOrmModule.forFeature([Comment, Craft, User]), UserAuthModule],
  controllers: [SocialInteractionController],
  providers: [SocialInteractionService],
  exports: [SocialInteractionService],
})
export class SocialInteractionModule {}
