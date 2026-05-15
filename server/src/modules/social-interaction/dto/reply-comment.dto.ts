import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyCommentDto {
  @ApiProperty({ description: '回复内容', maxLength: 500, example: '感谢你的喜欢！' })
  @IsString()
  @MaxLength(500)
  content: string;
}
