import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: '评论内容', maxLength: 500, example: '好漂亮的手工作品！' })
  @IsString()
  @MaxLength(500)
  content: string;

  @ApiPropertyOptional({ description: '父评论ID（回复时传入）', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  parent_id?: string;
}
