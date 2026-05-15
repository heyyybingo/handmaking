import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';

export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export class PresignDto {
  @ApiProperty({ description: '文件名' })
  @IsString()
  filename: string;

  @ApiProperty({ description: '文件类型', enum: FileType })
  @IsEnum(FileType)
  fileType: FileType;
}

export class ConfirmUploadDto {
  @ApiProperty({ description: '文件存储键' })
  @IsString()
  key: string;
}
