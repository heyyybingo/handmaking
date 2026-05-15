import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WxLoginDto {
  @ApiProperty({ description: '微信登录凭证code', example: '0a1B2c3D4e5F6g7H8i' })
  @IsString()
  @IsNotEmpty({ message: '微信登录code不能为空' })
  code: string;
}
