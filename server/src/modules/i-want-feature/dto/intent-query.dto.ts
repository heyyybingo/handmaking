import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IntentType, IntentStatus } from '@/entities/intent.entity';

export class IntentQueryDto {
  @ApiPropertyOptional({ description: '游标（上一页最后一条的created_at）', example: '2025-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: '每页数量', default: 20, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({ description: '意向类型筛选', enum: IntentType })
  @IsOptional()
  @IsEnum(IntentType)
  type?: IntentType;

  @ApiPropertyOptional({ description: '状态筛选', enum: IntentStatus })
  @IsOptional()
  @IsEnum(IntentStatus)
  status?: IntentStatus;
}
