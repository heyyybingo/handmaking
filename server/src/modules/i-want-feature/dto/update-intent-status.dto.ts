import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IntentStatus } from '@/entities/intent.entity';

/** 更新意向状态请求——仅允许设为已查看或已回复 */
export class UpdateIntentStatusDto {
  @ApiProperty({
    description: '意向状态',
    enum: IntentStatus,
    example: IntentStatus.VIEWED,
  })
  @IsEnum(IntentStatus)
  status: IntentStatus.VIEWED | IntentStatus.REPLIED;
}
