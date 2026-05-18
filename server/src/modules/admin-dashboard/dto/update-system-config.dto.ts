import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/** 系统配置项——键值对 */
class ConfigItemDto {
  @ApiProperty({ description: '配置键名', example: 'site_name' })
  @IsString()
  key: string;

  @ApiProperty({ description: '配置值', example: '手作展示平台' })
  @IsString()
  value: string;
}

/** 批量更新系统配置请求——按 key upsert 配置项 */
export class UpdateSystemConfigDto {
  @ApiProperty({
    description: '配置项列表',
    type: [ConfigItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigItemDto)
  configs: ConfigItemDto[];
}
