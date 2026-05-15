import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({ description: '管理员用户名', example: 'admin' })
  @IsString()
  username: string;

  @ApiProperty({ description: '管理员密码', example: 'Admin123' })
  @IsString()
  @MinLength(8, { message: '密码长度不能少于8位' })
  password: string;
}
