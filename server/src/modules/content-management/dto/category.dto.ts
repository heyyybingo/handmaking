import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MaxLength, IsArray, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  name: string;

  @ApiPropertyOptional({ description: '分类图标' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '排序序号', default: 0 })
  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: '分类名称', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  name?: string;

  @ApiPropertyOptional({ description: '分类图标' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '排序序号' })
  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class ReorderCategoriesDto {
  @ApiProperty({ description: '分类ID有序列表', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
