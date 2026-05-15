import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CraftShowcaseService } from './craft-showcase.service';
import { CraftQueryDto, CraftSearchDto } from './dto';
import { Craft } from '@/entities/craft.entity';

/**
 * 作品展示控制器
 * 小程序端公开接口，无需认证
 */
@ApiTags('小程序 - 作品展示')
@Controller('mini/crafts')
export class CraftShowcaseController {
  constructor(private readonly showcaseService: CraftShowcaseService) {}

  @Get()
  @ApiOperation({ summary: '获取作品列表' })
  @ApiResponse({ status: 200, description: '返回分页作品列表' })
  async findAll(@Query() query: CraftQueryDto) {
    return this.showcaseService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: '搜索作品' })
  @ApiResponse({ status: 200, description: '返回搜索结果' })
  @ApiQuery({ name: 'keyword', required: true, description: '搜索关键词' })
  async search(@Query() dto: CraftSearchDto) {
    return this.showcaseService.search(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取作品详情' })
  @ApiResponse({ status: 200, description: '返回作品详情', type: Craft })
  @ApiResponse({ status: 404, description: '作品不存在' })
  @ApiParam({ name: 'id', description: '作品ID' })
  async findOne(@Param('id') id: string) {
    return this.showcaseService.findOne(id);
  }
}
