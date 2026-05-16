import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class SuggestTagsDto {
  @ApiProperty({ description: '图片URL' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ description: '作品描述' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ImageSuggestionDto {
  @ApiProperty({ description: '图片URL' })
  @IsString()
  imageUrl: string;
}
