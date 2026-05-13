import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './common/redis/redis.module';
import { CraftShowcaseModule } from './modules/craft-showcase/craft-showcase.module';
import { ContentManagementModule } from './modules/content-management/content-management.module';
import { SocialInteractionModule } from './modules/social-interaction/social-interaction.module';
import { IWantFeatureModule } from './modules/i-want-feature/i-want-feature.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { UserAuthModule } from './modules/user-auth/user-auth.module';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';
import { StorageModule } from './storage/storage.module';

/**
 * 根模块
 * 集成全局配置、数据库、Redis、存储服务等基础设施
 * 按业务能力划分子模块
 */
@Module({
  imports: [
    // 全局配置模块，加载.env文件
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'dev'}`,
        '.env.example',
      ],
    }),

    // TypeORM 数据库连接配置
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USER', 'handcraft'),
        password: configService.get<string>('DATABASE_PASSWORD', 'handcraft-dev'),
        database: configService.get<string>('DATABASE_NAME', 'handcraft'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    // Redis 缓存模块
    RedisModule,

    // 文件存储模块
    StorageModule,

    // 业务模块
    CraftShowcaseModule,
    ContentManagementModule,
    SocialInteractionModule,
    IWantFeatureModule,
    AiAssistantModule,
    UserAuthModule,
    AdminDashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
