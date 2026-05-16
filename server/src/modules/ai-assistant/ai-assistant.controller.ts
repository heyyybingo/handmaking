import { Controller, Get, Put, Post, Body, Param, Sse, MessageEvent } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Observable, map } from 'rxjs';
import { AiAssistantService } from './ai-assistant.service';
import { UpdateAiConfigDto, GenerateDescriptionDto, SuggestTagsDto, ImageSuggestionDto } from './dto/ai-config.dto';

@ApiTags('AI助手')
@Controller('admin/ai')
export class AiAssistantController {
  constructor(private readonly aiService: AiAssistantService) {}

  @Get('config/:feature')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取AI配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getConfig(@Param('feature') feature: string) {
    return this.aiService.getConfig(feature);
  }

  @Put('config/:feature')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新AI配置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateConfig(
    @Param('feature') feature: string,
    @Body() dto: UpdateAiConfigDto,
  ) {
    return this.aiService.updateConfig(feature, dto);
  }

  @Post('generate-description')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI生成作品描述' })
  @ApiResponse({ status: 200, description: '生成成功' })
  @Sse('generate-description-stream')
  generateDescriptionStream(@Body() dto: GenerateDescriptionDto): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      this.aiService.generateDescription(dto).then((result) => {
        const chars = result.description.split('');
        chars.forEach((char, index) => {
          setTimeout(() => {
            subscriber.next({ data: char } as MessageEvent);
            if (index === chars.length - 1) {
              subscriber.complete();
            }
          }, index * 50);
        });
      }).catch((error) => {
        subscriber.error(error);
      });
    });
  }

  @Post('suggest-tags')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI推荐标签' })
  @ApiResponse({ status: 200, description: '推荐成功' })
  async suggestTags(@Body() dto: SuggestTagsDto) {
    return this.aiService.suggestTags(dto);
  }

  @Post('image-suggestion')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI图片优化建议' })
  @ApiResponse({ status: 200, description: '建议生成成功' })
  async suggestImageOptimization(@Body() dto: ImageSuggestionDto) {
    return this.aiService.suggestImageOptimization(dto);
  }
}
