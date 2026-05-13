/**
 * 存储服务接口
 * 定义文件存储的统一操作接口，由MinIO/OSS等具体Provider实现
 * 根据STORAGE_PROVIDER环境变量切换Provider，业务代码无需修改
 */
export interface IStorageService {
  /**
   * 获取预签名URL
   * @param key - 文件存储键
   * @param action - 操作类型：上传或下载
   * @param expires - 过期时间（秒），默认3600
   * @returns 预签名URL字符串
   */
  getPresignedUrl(key: string, action: 'upload' | 'download', expires?: number): Promise<string>;

  /**
   * 确认上传完成
   * @param key - 文件存储键
   */
  confirmUpload(key: string): Promise<void>;

  /**
   * 获取文件公开访问URL
   * @param key - 文件存储键
   * @returns 文件访问URL
   */
  getFileUrl(key: string): string;

  /**
   * 删除文件
   * @param key - 文件存储键
   */
  deleteFile(key: string): Promise<void>;

  /**
   * 生成缩略图
   * 生成3种尺寸缩略图并存储到同一Provider
   * @param key - 原始文件存储键
   */
  generateThumbnails(key: string): Promise<void>;
}

/**
 * 预签名URL操作类型枚举
 */
export enum PresignedUrlAction {
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
}

/**
 * 缩略图尺寸定义
 * 200x200: 列表缩略图
 * 400x400: 瀑布流展示
 * 原图: 详情页展示（仅做WebP格式转换）
 */
export const THUMBNAIL_SIZES = [
  { width: 200, height: 200, suffix: '200x200' },
  { width: 400, height: 400, suffix: '400x400' },
] as const;
