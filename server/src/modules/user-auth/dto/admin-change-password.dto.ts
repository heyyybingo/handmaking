import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** 管理员修改密码请求——需提供旧密码和新密码，新密码需包含大小写字母和数字 */
export class AdminChangePasswordDto {
  @ApiProperty({ description: '当前密码', example: 'OldPass123' })
  @IsString()
  @MinLength(8, { message: '密码长度不能少于8位' })
  oldPassword: string;

  @ApiProperty({
    description: '新密码（需包含大写字母、小写字母和数字）',
    example: 'NewPass123',
  })
  @IsString()
  @MinLength(8, { message: '密码长度不能少于8位' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: '新密码必须包含大写字母、小写字母和数字',
  })
  newPassword: string;
}
