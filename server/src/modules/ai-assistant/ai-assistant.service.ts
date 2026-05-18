import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiConfig } from './entities/ai-config.entity';
import {
  UpdateAiConfigDto,
  GenerateDescriptionDto,
  SuggestTagsDto,
  ImageSuggestionDto,
} from './dto/ai-config.dto';

/**
 * AI 助手服务——管理 AI 功能配置，调用 AI API 生成描述、标签和建议
 * 当前 AI 调用为 mock 实现，返回预设的示例文案
 */
@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    @InjectRepository(AiConfig)
    private readonly configRepository: Repository<AiConfig>,
  ) {}

  async getConfig(feature: string): Promise<AiConfig> {
    const config = await this.configRepository.findOne({ where: { feature } });
    if (!config) {
      throw new NotFoundException(`AI配置 ${feature} 不存在`);
    }
    return config;
  }

  async updateConfig(
    feature: string,
    dto: UpdateAiConfigDto,
  ): Promise<AiConfig> {
    let config = await this.configRepository.findOne({ where: { feature } });

    if (!config) {
      config = this.configRepository.create({ feature, ...dto });
    } else {
      Object.assign(config, dto);
    }

    return this.configRepository.save(config);
  }

  async generateDescription(
    dto: GenerateDescriptionDto,
  ): Promise<{ description: string }> {
    const config = await this.getConfig('description');

    if (!config.isEnabled) {
      throw new Error('AI描述生成功能已禁用');
    }

    this.logger.log(
      `Generating description for ${dto.imageUrls.length} images`,
    );

    const description = await this.callAiApi(config, {
      prompt: this.buildDescriptionPrompt(config.promptTemplate, dto),
    });

    return { description };
  }

  async suggestTags(dto: SuggestTagsDto): Promise<{ tags: string[] }> {
    const config = await this.getConfig('tags');

    if (!config.isEnabled) {
      throw new Error('AI标签建议功能已禁用');
    }

    this.logger.log(`Suggesting tags for image: ${dto.imageUrl}`);

    const tags = await this.callAiApi(config, {
      prompt: this.buildTagsPrompt(config.promptTemplate, dto),
    });

    return { tags: JSON.parse(tags) };
  }

  async suggestImageOptimization(
    dto: ImageSuggestionDto,
  ): Promise<{ suggestions: string }> {
    const config = await this.getConfig('image');

    if (!config.isEnabled) {
      throw new Error('AI图片优化建议功能已禁用');
    }

    this.logger.log(`Generating image suggestions for: ${dto.imageUrl}`);

    const suggestions = await this.callAiApi(config, {
      prompt: this.buildImagePrompt(config.promptTemplate, dto),
    });

    return { suggestions };
  }

  private buildDescriptionPrompt(
    template: string,
    dto: GenerateDescriptionDto,
  ): string {
    return template
      .replace('{{imageUrls}}', dto.imageUrls.join(', '))
      .replace('{{tags}}', dto.tags?.join(', ') || '')
      .replace('{{existingDescription}}', dto.existingDescription || '');
  }

  private buildTagsPrompt(template: string, dto: SuggestTagsDto): string {
    return template
      .replace('{{imageUrl}}', dto.imageUrl)
      .replace('{{description}}', dto.description || '');
  }

  private buildImagePrompt(template: string, dto: ImageSuggestionDto): string {
    return template.replace('{{imageUrl}}', dto.imageUrl);
  }

  private async callAiApi(
    config: AiConfig,
    params: { prompt: string },
  ): Promise<string> {
    this.logger.log(
      `Calling AI API with model: ${config.model}, temperature: ${config.temperature}`,
    );

    return `这是一件精美的手工作品，展现了独特的匠心和创意。作品细节处理精致，色彩搭配和谐，整体呈现出温暖而优雅的气质。`;
  }
}
