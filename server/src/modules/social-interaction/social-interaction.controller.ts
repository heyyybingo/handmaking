import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
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
import { SocialInteractionService } from './social-interaction.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReplyCommentDto } from './dto/reply-comment.dto';
import { CommentQueryDto } from './dto/comment-query.dto';

@ApiTags('社交互动')
@Controller()
export class SocialInteractionController {
  constructor(
    private readonly socialService: SocialInteractionService,
  ) {}

  // ========== Mini Routes ==========

  @Post('mini/crafts/:craftId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '切换点赞状态' })
  @ApiResponse({ status: 200, description: '返回点赞状态和总数' })
  async toggleLike(
    @Param('craftId') craftId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.socialService.toggleLike(craftId, userId);
  }

  @Get('mini/crafts/:craftId/like/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '检查当前用户是否已点赞' })
  @ApiResponse({ status: 200, description: '返回是否已点赞' })
  async getLikeStatus(
    @Param('craftId') craftId: string,
    @CurrentUser('userId') userId: string,
  ) {
    const liked = await this.socialService.isLiked(craftId, userId);
    return { liked };
  }

  @Post('mini/crafts/:craftId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建评论' })
  @ApiResponse({ status: 201, description: '评论创建成功' })
  async createComment(
    @Param('craftId') craftId: string,
    @CurrentUser() user: { userId: string; role: string },
    @Body() dto: CreateCommentDto,
  ) {
    return this.socialService.createComment(
      craftId,
      user.userId,
      dto,
      user.role,
    );
  }

  @Get('mini/crafts/:craftId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取评论列表' })
  @ApiResponse({ status: 200, description: '返回评论列表（游标分页）' })
  async getComments(
    @Param('craftId') craftId: string,
    @Query() query: CommentQueryDto,
  ) {
    return this.socialService.findComments(craftId, query);
  }

  @Delete('mini/comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除自己的评论' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async deleteOwnComment(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    await this.socialService.deleteComment(id, user.userId, user.role);
  }

  // ========== Admin Routes ==========

  @Post('admin/comments/:id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '作者回复评论' })
  @ApiResponse({ status: 201, description: '回复创建成功' })
  async replyAsAuthor(
    @Param('id') commentId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: ReplyCommentDto,
  ) {
    return this.socialService.replyAsAuthor(commentId, userId, dto);
  }

  @Delete('admin/comments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '管理员删除评论' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async adminDeleteComment(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    await this.socialService.deleteComment(id, user.userId, user.role);
  }
}
