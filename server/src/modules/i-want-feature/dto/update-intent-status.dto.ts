import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IntentStatus } from '@/entities/intent.entity';

export class UpdateIntentStatusDto {
  @ApiProperty({ description: '意向状态', enum: IntentStatus, example: IntentStatus.VIEWED })
  @IsEnum(IntentStatus)
  status: IntentStatus.VIEWED | IntentStatus.REPLIED;
}
