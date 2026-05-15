import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';

export enum BatchAction {
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  ARCHIVE = 'archive',
  DELETE = 'delete',
  MOVE_CATEGORY = 'move_category',
}

export class BatchActionDto {
  @ApiProperty({ description: '作品ID列表', type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];

  @ApiProperty({ description: '批量操作类型', enum: BatchAction })
  @IsEnum(BatchAction)
  action: BatchAction;

  @ApiPropertyOptional({ description: '目标分类ID（move_category时必填）' })
  @IsOptional()
  @IsUUID()
  category_id?: string;
}
