import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CraftShowcaseService } from './craft-showcase.service';

/**
 * 分类展示控制器
 * 小程序端公开接口，无需认证
 */
@ApiTags('小程序 - 分类')
@Controller('mini/categories')
export class CategoryShowcaseController {
  constructor(private readonly showcaseService: CraftShowcaseService) {}

  @Get()
  @ApiOperation({ summary: '获取分类列表（含作品数量）' })
  @ApiResponse({ status: 200, description: '返回分类列表及各分类作品数量' })
  async findAll() {
    return this.showcaseService.findCategories();
  }
}
