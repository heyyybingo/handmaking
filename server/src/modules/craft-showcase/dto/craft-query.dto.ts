import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { CraftStatus } from '@/entities/craft.entity';

export class CraftQueryDto {
  @ApiPropertyOptional({ description: '分页游标，传入上一页最后一条的created_at' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: '每页数量', default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit: number = 10;

  @ApiPropertyOptional({ description: '按分类ID筛选' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ description: '按状态筛选', enum: CraftStatus })
  @IsOptional()
  @IsEnum(CraftStatus)
  status?: CraftStatus;
}
