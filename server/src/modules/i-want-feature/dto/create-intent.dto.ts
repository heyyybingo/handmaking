import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IntentType } from '@/entities/intent.entity';

export class CreateIntentDto {
  @ApiProperty({ description: '意向类型', enum: IntentType, example: IntentType.WANT_COLLECT })
  @IsEnum(IntentType)
  type: IntentType;

  @ApiPropertyOptional({ description: '留言', maxLength: 200, example: '请问这个作品还在吗？' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  message?: string;

  @ApiPropertyOptional({ description: '联系方式', maxLength: 100, example: 'wechat:abc123' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  visitor_contact?: string;
}
