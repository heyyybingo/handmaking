import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

/** 文件类型 */
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
}

/** 预签名上传请求——获取文件直传到存储服务的预签名URL */
export class PresignDto {
  @ApiProperty({ description: '文件名' })
  @IsString()
  filename: string;

  @ApiProperty({ description: '文件类型', enum: FileType })
  @IsEnum(FileType)
  fileType: FileType;
}

/** 确认上传完成请求——通知服务端文件已成功上传，触发缩略图生成 */
export class ConfirmUploadDto {
  @ApiProperty({ description: '文件存储键' })
  @IsString()
  key: string;
}
