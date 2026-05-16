import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiConfig } from './entities/ai-config.entity';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantController } from './ai-assistant.controller';

/**
 * AI辅助模块
 * 负责AI生成作品描述、标签建议、图片优化建议、Prompt配置
 */
@Module({
  imports: [TypeOrmModule.forFeature([AiConfig])],
  controllers: [AiAssistantController],
  providers: [AiAssistantService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
