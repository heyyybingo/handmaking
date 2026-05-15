import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ContentManagementService } from './content-management.service';
import {
  CreateCraftDto,
  UpdateCraftDto,
  BatchActionDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoriesDto,
  PresignDto,
  ConfirmUploadDto,
} from './dto';
import { CraftQueryDto } from '../craft-showcase/dto';
import { JwtAuthGuard } from '@/modules/user-auth/auth.guard';
import { RolesGuard } from '@/modules/user-auth/roles.guard';
import { Roles } from '@/modules/user-auth/decorators/roles.decorator';

/**
 * 内容管理控制器
 * 管理端接口，需要JWT认证和admin角色
 */
@ApiTags('管理端 - 内容管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class ContentManagementController {
  constructor(private readonly contentService: ContentManagementService) {}

  // ── 作品接口 ──

  @Post('crafts')
  @ApiOperation({ summary: '创建作品' })
  @ApiResponse({ status: 201, description: '作品创建成功' })
  async createCraft(@Body() dto: CreateCraftDto) {
    return this.contentService.createCraft(dto);
  }

  @Put('crafts/:id')
  @ApiOperation({ summary: '更新作品' })
  @ApiResponse({ status: 200, description: '作品更新成功' })
  @ApiResponse({ status: 404, description: '作品不存在' })
  @ApiParam({ name: 'id', description: '作品ID' })
  async updateCraft(@Param('id') id: string, @Body() dto: UpdateCraftDto) {
    return this.contentService.updateCraft(id, dto);
  }

  @Delete('crafts/:id')
  @ApiOperation({ summary: '删除作品（软删除）' })
  @ApiResponse({ status: 200, description: '作品删除成功' })
  @ApiResponse({ status: 404, description: '作品不存在' })
  @ApiParam({ name: 'id', description: '作品ID' })
  async deleteCraft(@Param('id') id: string) {
    await this.contentService.deleteCraft(id);
    return { message: '删除成功' };
  }

  @Get('crafts')
  @ApiOperation({ summary: '获取作品列表（管理端，含所有状态）' })
  @ApiResponse({ status: 200, description: '返回分页作品列表' })
  async findAdminCrafts(@Query() query: CraftQueryDto) {
    return this.contentService.findAdminCrafts(query);
  }

  @Post('crafts/batch')
  @ApiOperation({ summary: '批量操作作品' })
  @ApiResponse({ status: 200, description: '批量操作成功' })
  async batchOperation(@Body() dto: BatchActionDto) {
    await this.contentService.batchOperation(dto);
    return { message: '批量操作成功' };
  }

  // ── 分类接口 ──

  @Post('categories')
  @ApiOperation({ summary: '创建分类' })
  @ApiResponse({ status: 201, description: '分类创建成功' })
  @ApiResponse({ status: 400, description: '分类名称已存在' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.contentService.createCategory(dto);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: '更新分类' })
  @ApiResponse({ status: 200, description: '分类更新成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiParam({ name: 'id', description: '分类ID' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.contentService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: '删除分类' })
  @ApiResponse({ status: 200, description: '分类删除成功' })
  @ApiResponse({ status: 400, description: '分类下存在作品，无法删除' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiParam({ name: 'id', description: '分类ID' })
  async deleteCategory(@Param('id') id: string) {
    await this.contentService.deleteCategory(id);
    return { message: '删除成功' };
  }

  @Get('categories')
  @ApiOperation({ summary: '获取分类列表' })
  @ApiResponse({ status: 200, description: '返回分类列表' })
  async findAllCategories() {
    return this.contentService.findAllCategories();
  }

  @Put('categories/reorder')
  @ApiOperation({ summary: '重新排序分类' })
  @ApiResponse({ status: 200, description: '排序更新成功' })
  async reorderCategories(@Body() dto: ReorderCategoriesDto) {
    await this.contentService.reorderCategories(dto.ids);
    return { message: '排序更新成功' };
  }

  // ── 文件接口 ──

  @Post('files/presign')
  @ApiOperation({ summary: '获取预签名上传URL' })
  @ApiResponse({ status: 200, description: '返回预签名URL和文件键' })
  async getPresignedUrl(@Body() dto: PresignDto) {
    return this.contentService.getPresignedUrl(dto);
  }

  @Post('files/confirm')
  @ApiOperation({ summary: '确认上传完成' })
  @ApiResponse({ status: 200, description: '上传确认成功，返回文件URL' })
  async confirmUpload(@Body() dto: ConfirmUploadDto) {
    return this.contentService.confirmUpload(dto);
  }
}
