import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 更新 AI 配置请求——按功能维度更新提示词模板、模型、温度等参数 */
export class UpdateAiConfigDto {
  @ApiPropertyOptional({ description: 'Prompt模板' })
  @IsString()
  @IsOptional()
  promptTemplate?: string;

  @ApiPropertyOptional({ description: 'AI模型名称' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ description: '温度参数', minimum: 0, maximum: 2 })
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}

/** 生成描述请求——传入图片列表和可选的已有标签/描述 */
export class GenerateDescriptionDto {
  @ApiProperty({ description: '图片URL列表' })
  @IsString({ each: true })
  imageUrls: string[];

  @ApiPropertyOptional({ description: '已有标签' })
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: '已有描述' })
  @IsString()
  @IsOptional()
  existingDescription?: string;
}

/** 标签建议请求——传入图片和可选的描述信息 */
export class SuggestTagsDto {
  @ApiProperty({ description: '图片URL' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ description: '作品描述' })
  @IsString()
  @IsOptional()
  description?: string;
}

/** 图片优化建议请求——传入单张图片获取构图/色彩等优化建议 */
export class ImageSuggestionDto {
  @ApiProperty({ description: '图片URL' })
  @IsString()
  imageUrl: string;
}
