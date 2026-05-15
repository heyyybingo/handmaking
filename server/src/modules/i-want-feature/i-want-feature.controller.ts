import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/user-auth/auth.guard';
import { RolesGuard } from '@/modules/user-auth/roles.guard';
import { Roles } from '@/modules/user-auth/decorators/roles.decorator';
import { CurrentUser } from '@/modules/user-auth/decorators/current-user.decorator';
import { UserRole } from '@/entities/user.entity';
import { IWantFeatureService } from './i-want-feature.service';
import { CreateIntentDto } from './dto/create-intent.dto';
import { IntentQueryDto } from './dto/intent-query.dto';
import { UpdateIntentStatusDto } from './dto/update-intent-status.dto';

@ApiTags('我想要')
@Controller()
export class IWantFeatureController {
  constructor(private readonly iWantService: IWantFeatureService) {}

  // ========== Mini Routes ==========

  @Post('mini/crafts/:craftId/intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交意向' })
  @ApiResponse({ status: 201, description: '意向提交成功' })
  async createIntent(
    @Param('craftId') craftId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateIntentDto,
  ) {
    return this.iWantService.createIntent(craftId, userId, dto);
  }

  // ========== Admin Routes ==========

  @Get('admin/intents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取意向列表' })
  @ApiResponse({ status: 200, description: '返回意向列表（游标分页）' })
  async getIntents(@Query() query: IntentQueryDto) {
    return this.iWantService.findIntents(query);
  }

  @Put('admin/intents/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新意向状态' })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  async updateIntentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateIntentStatusDto,
  ) {
    return this.iWantService.updateStatus(id, dto);
  }

  @Get('admin/intents/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取意向统计' })
  @ApiResponse({ status: 200, description: '返回意向统计数据' })
  async getIntentStats() {
    return this.iWantService.getStats();
  }
}
