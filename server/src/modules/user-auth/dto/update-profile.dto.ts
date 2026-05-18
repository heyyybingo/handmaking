import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 更新用户资料请求——首次完善资料后标记 has_profile 为 true */
export class UpdateProfileDto {
  @ApiProperty({ description: '昵称', example: '手作达人' })
  @IsString()
  @MinLength(2, { message: '昵称至少2个字符' })
  @MaxLength(30, { message: '昵称最多30个字符' })
  nickname: string;

  @ApiPropertyOptional({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  @IsOptional()
  @IsUrl({}, { message: '头像地址格式不正确' })
  avatarUrl?: string;
}
