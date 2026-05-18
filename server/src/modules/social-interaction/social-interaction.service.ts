import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, AuthorType } from '@/entities/comment.entity';
import { Craft } from '@/entities/craft.entity';
import { User } from '@/entities/user.entity';
import { RedisService } from '@/common/redis/redis.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReplyCommentDto } from './dto/reply-comment.dto';
import { CommentQueryDto } from './dto/comment-query.dto';

/**
 * 社交互动服务——处理点赞（Redis Set）、评论CRUD、作者回复
 */
@Injectable()
export class SocialInteractionService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Craft)
    private readonly craftRepo: Repository<Craft>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  // ========== Like Methods ==========

  /**
   * 切换点赞状态
   * 使用Redis SET存储点赞用户，SET计数器维护点赞数
   */
  async toggleLike(
    craftId: string,
    userId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const craft = await this.craftRepo.findOne({ where: { id: craftId } });
    if (!craft) {
      throw new NotFoundException('作品不存在');
    }

    const redis = this.redisService.getClient();
    const setKey = `craft:likes:${craftId}`;
    const countKey = `craft:like_count:${craftId}`;

    const isMember = await redis.sismember(setKey, userId);

    if (isMember) {
      // 取消点赞
      await redis.srem(setKey, userId);
      const newCount = await this.redisService.decr(countKey);
      const clampedCount = Math.max(0, newCount);

      // 回写数据库
      await this.craftRepo.update(craftId, {
        like_count: clampedCount,
      });

      return { liked: false, likeCount: clampedCount };
    } else {
      // 点赞
      await redis.sadd(setKey, userId);
      const newCount = await this.redisService.incr(countKey);

      // 回写数据库
      await this.craftRepo.update(craftId, {
        like_count: newCount,
      });

      return { liked: true, likeCount: newCount };
    }
  }

  /**
   * 检查用户是否已点赞
   */
  async isLiked(craftId: string, userId: string): Promise<boolean> {
    const redis = this.redisService.getClient();
    const setKey = `craft:likes:${craftId}`;
    const result = await redis.sismember(setKey, userId);
    return result === 1;
  }

  // ========== Comment Methods ==========

  /**
   * 创建评论
   * 通过userId查找用户昵称和头像
   */
  async createComment(
    craftId: string,
    userId: string,
    dto: CreateCommentDto,
    role: string,
  ): Promise<Comment> {
    const craft = await this.craftRepo.findOne({ where: { id: craftId } });
    if (!craft) {
      throw new NotFoundException('作品不存在');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const authorType = role === 'admin' ? AuthorType.ADMIN : AuthorType.VISITOR;

    // 如果是回复，检查父评论是否存在且属于同一作品
    if (dto.parent_id) {
      const parentComment = await this.commentRepo.findOne({
        where: { id: dto.parent_id },
      });
      if (!parentComment) {
        throw new NotFoundException('父评论不存在');
      }
      if (parentComment.craft_id !== craftId) {
        throw new BadRequestException('父评论不属于该作品');
      }
    }

    const comment = this.commentRepo.create({
      craft_id: craftId,
      parent_id: dto.parent_id ?? undefined,
      content: dto.content,
      author_type: authorType,
      author_name: user.nickname,
      author_avatar: user.avatar_url || undefined,
      is_author_reply: false,
      author_id: userId,
    });

    const saved = await this.commentRepo.save(comment);

    // 递增评论计数
    await this.craftRepo.increment({ id: craftId }, 'comment_count', 1);

    return saved;
  }

  /**
   * 查询评论列表（游标分页）
   */
  async findComments(
    craftId: string,
    query: CommentQueryDto,
  ): Promise<{
    items: Comment[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const limit = query.limit ?? 20;

    const qb = this.commentRepo
      .createQueryBuilder('comment')
      .where('comment.craft_id = :craftId', { craftId })
      .orderBy('comment.created_at', 'DESC')
      .take(limit + 1);

    if (query.cursor) {
      qb.andWhere('comment.created_at < :cursor', {
        cursor: new Date(query.cursor),
      });
    }

    const results = await qb.getMany();
    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    const nextCursor =
      hasMore && items.length > 0
        ? items[items.length - 1].created_at.toISOString()
        : null;

    return { items, nextCursor, hasMore };
  }

  /**
   * 删除评论
   * 仅评论作者或管理员可删除
   */
  async deleteComment(
    commentId: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    // 管理员或评论作者可删除
    if (userRole !== 'admin' && comment.author_id !== userId) {
      throw new ForbiddenException('无权删除此评论');
    }

    await this.commentRepo.remove(comment);

    // 递减评论计数，不低于0
    const craft = await this.craftRepo.findOne({
      where: { id: comment.craft_id },
    });
    if (craft && craft.comment_count > 0) {
      await this.craftRepo.decrement(
        { id: comment.craft_id },
        'comment_count',
        1,
      );
    }
  }

  /**
   * 作者回复评论
   * 通过userId查找管理员昵称和头像
   */
  async replyAsAuthor(
    commentId: string,
    adminUserId: string,
    dto: ReplyCommentDto,
  ): Promise<Comment> {
    const parentComment = await this.commentRepo.findOne({
      where: { id: commentId },
    });
    if (!parentComment) {
      throw new NotFoundException('原评论不存在');
    }

    const admin = await this.userRepo.findOne({
      where: { id: adminUserId },
    });
    if (!admin) {
      throw new NotFoundException('管理员用户不存在');
    }

    const reply = this.commentRepo.create({
      craft_id: parentComment.craft_id,
      parent_id: commentId,
      content: dto.content,
      author_type: AuthorType.ADMIN,
      author_name: admin.nickname,
      author_avatar: admin.avatar_url || undefined,
      is_author_reply: true,
      author_id: adminUserId,
    });

    const saved = await this.commentRepo.save(reply);

    // 递增评论计数
    await this.craftRepo.increment(
      { id: parentComment.craft_id },
      'comment_count',
      1,
    );

    return saved;
  }
}
