import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Intent } from '@/entities/intent.entity';
import { Craft } from '@/entities/craft.entity';
import { User } from '@/entities/user.entity';
import { UserAuthModule } from '@/modules/user-auth/user-auth.module';
import { IWantFeatureService } from './i-want-feature.service';
import { IWantFeatureController } from './i-want-feature.controller';

/**
 * "我想要"模块
 * 负责意向表达、意向收集、通知提醒等模拟下单功能
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Intent, Craft, User]),
    UserAuthModule,
  ],
  controllers: [IWantFeatureController],
  providers: [IWantFeatureService],
  exports: [IWantFeatureService],
})
export class IWantFeatureModule {}
