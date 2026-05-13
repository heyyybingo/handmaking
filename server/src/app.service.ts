import { Injectable } from '@nestjs/common';

/**
 * 应用基础服务
 * 提供健康检查等基础接口
 */
@Injectable()
export class AppService {
  /**
   * 健康检查
   * @returns 服务状态信息
   */
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
