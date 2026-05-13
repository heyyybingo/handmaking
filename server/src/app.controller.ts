import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

/**
 * 应用基础控制器
 * 提供健康检查等公共接口
 */
@ApiTags('默认')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 健康检查接口
   * 用于负载均衡和服务监控判断服务是否存活
   */
  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  getHealth() {
    return this.appService.getHealth();
  }
}
