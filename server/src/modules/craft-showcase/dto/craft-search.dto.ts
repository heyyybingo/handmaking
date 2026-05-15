import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CraftSearchDto {
  @ApiProperty({ description: '搜索关键词' })
  @IsString()
  @MinLength(1)
  keyword: string;

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
}
