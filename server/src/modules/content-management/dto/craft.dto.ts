import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  MaxLength,
  IsUUID,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CraftStatus } from '@/entities/craft.entity';

class ImageItemDto {
  @ApiProperty({ description: '图片URL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: '缩略图URL' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: '图片宽度' })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ description: '图片高度' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ description: '排序序号' })
  @IsOptional()
  @IsNumber()
  sort?: number;
}

class VideoDto {
  @ApiProperty({ description: '视频URL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: '封面图URL' })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional({ description: '视频时长（秒）' })
  @IsOptional()
  @IsNumber()
  duration?: number;
}

export class CreateCraftDto {
  @ApiProperty({ description: '作品标题', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  title: string;

  @ApiPropertyOptional({ description: '作品描述', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: '图片列表', type: [ImageItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageItemDto)
  images?: ImageItemDto[];

  @ApiPropertyOptional({ description: '视频信息', type: VideoDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => VideoDto)
  video?: VideoDto;

  @ApiProperty({ description: '分类ID' })
  @IsUUID()
  category_id: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '状态', enum: CraftStatus, default: CraftStatus.DRAFT })
  @IsOptional()
  @IsEnum(CraftStatus)
  status?: CraftStatus;

  @ApiPropertyOptional({ description: '排序序号', default: 0 })
  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class UpdateCraftDto {
  @ApiPropertyOptional({ description: '作品标题', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  title?: string;

  @ApiPropertyOptional({ description: '作品描述', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: '图片列表', type: [ImageItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageItemDto)
  images?: ImageItemDto[];

  @ApiPropertyOptional({ description: '视频信息', type: VideoDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => VideoDto)
  video?: VideoDto;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '状态', enum: CraftStatus })
  @IsOptional()
  @IsEnum(CraftStatus)
  status?: CraftStatus;

  @ApiPropertyOptional({ description: '排序序号' })
  @IsOptional()
  @IsNumber()
  sort_order?: number;
}
