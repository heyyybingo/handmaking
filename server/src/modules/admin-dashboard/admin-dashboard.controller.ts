import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../user-auth/auth.guard';
import { RolesGuard } from '../user-auth/roles.guard';
import { Roles } from '../user-auth/decorators/roles.decorator';
import { AdminDashboardService } from './admin-dashboard.service';
import { UpdateSystemConfigDto } from './dto';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: '获取管理后台数据概览', description: '返回统计指标及7天趋势数据' })
  @ApiResponse({ status: 200, description: '返回统计数据及趋势' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 403, description: '无权限' })
  getStats() {
    return this.dashboardService.getStats();
  }
}

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@Controller('admin/config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminConfigController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get()
  @ApiOperation({ summary: '获取系统配置', description: '返回所有系统配置键值对' })
  @ApiResponse({ status: 200, description: '返回系统配置' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 403, description: '无权限' })
  getAllConfigs() {
    return this.dashboardService.getAllConfigs();
  }

  @Put()
  @ApiOperation({ summary: '更新系统配置', description: '批量更新系统配置项（upsert by key）' })
  @ApiResponse({ status: 200, description: '更新成功，返回最新配置' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 403, description: '无权限' })
  updateConfigs(@Body() dto: UpdateSystemConfigDto) {
    return this.dashboardService.updateConfigs(dto);
  }
}
