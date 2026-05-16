import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SocialInteractionService } from './social-interaction.service';
import { Comment, AuthorType } from '@/entities/comment.entity';
import { Craft } from '@/entities/craft.entity';
import { User, UserRole } from '@/entities/user.entity';
import { RedisService } from '@/common/redis/redis.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReplyCommentDto } from './dto/reply-comment.dto';
import { CommentQueryDto } from './dto/comment-query.dto';

describe('SocialInteractionService', () => {
  let service: SocialInteractionService;
  let commentRepo: Record<string, jest.Mock>;
  let craftRepo: Record<string, jest.Mock>;
  let userRepo: Record<string, jest.Mock>;
  let redisService: Record<string, jest.Mock>;
  let redisClient: Record<string, jest.Mock>;

  const mockCraft = (overrides: Partial<Craft> = {}): Craft =>
    ({
      id: 'craft-uuid-1',
      title: '手工编织花篮',
      category_id: 'cat-1',
      like_count: 10,
      comment_count: 3,
      intent_count: 1,
      deleted_at: null,
      created_at: new Date(),
      ...overrides,
    }) as unknown as Craft;

  const mockUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'user-uuid-1',
      openid: 'wx-openid-123',
      nickname: '手作爱好者',
      avatar_url: 'https://example.com/avatar.jpg',
      has_profile: true,
      role: UserRole.VISITOR,
      ...overrides,
    }) as unknown as User;

  const mockAdminUser = (overrides: Partial<User> = {}): User =>
    ({
      id: 'admin-uuid-1',
      openid: 'admin-default',
      nickname: '管理员',
      avatar_url: 'https://example.com/admin-avatar.jpg',
      has_profile: true,
      role: UserRole.ADMIN,
      ...overrides,
    }) as unknown as User;

  const mockComment = (overrides: Partial<Comment> = {}): Comment =>
    ({
      id: 'comment-uuid-1',
      craft_id: 'craft-uuid-1',
      parent_id: null,
      content: '好漂亮的手工作品！',
      author_type: AuthorType.VISITOR,
      author_name: '手作爱好者',
      author_avatar: 'https://example.com/avatar.jpg',
      is_author_reply: false,
      author_id: 'user-uuid-1',
      created_at: new Date('2025-01-15T10:00:00Z'),
      ...overrides,
    }) as unknown as Comment;

  beforeEach(async () => {
    jest.clearAllMocks();

    redisClient = {
      sismember: jest.fn(),
      sadd: jest.fn(),
      srem: jest.fn(),
    };

    redisService = {
      getClient: jest.fn().mockReturnValue(redisClient),
      incr: jest.fn(),
      decr: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    commentRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    craftRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialInteractionService,
        {
          provide: getRepositoryToken(Comment),
          useValue: commentRepo,
        },
        {
          provide: getRepositoryToken(Craft),
          useValue: craftRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    service = module.get<SocialInteractionService>(SocialInteractionService);
  });

  describe('toggleLike', () => {
    const craftId = 'craft-uuid-1';
    const userId = 'user-uuid-1';

    it('should like a craft that is not yet liked', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());
      redisClient.sismember.mockResolvedValue(0); // not a member
      redisService.incr.mockResolvedValue(11);

      const result = await service.toggleLike(craftId, userId);

      expect(result.liked).toBe(true);
      expect(result.likeCount).toBe(11);
      expect(redisClient.sadd).toHaveBeenCalledWith(
        `craft:likes:${craftId}`,
        userId,
      );
      expect(craftRepo.update).toHaveBeenCalledWith(craftId, {
        like_count: 11,
      });
    });

    it('should unlike a craft that is already liked', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());
      redisClient.sismember.mockResolvedValue(1); // is a member
      redisService.decr.mockResolvedValue(9);

      const result = await service.toggleLike(craftId, userId);

      expect(result.liked).toBe(false);
      expect(result.likeCount).toBe(9);
      expect(redisClient.srem).toHaveBeenCalledWith(
        `craft:likes:${craftId}`,
        userId,
      );
      expect(craftRepo.update).toHaveBeenCalledWith(craftId, {
        like_count: 9,
      });
    });

    it('should throw NotFoundException when craft does not exist', async () => {
      craftRepo.findOne.mockResolvedValue(null);

      await expect(service.toggleLike(craftId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should clamp like count to 0 when decrementing below zero', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft({ like_count: 0 }));
      redisClient.sismember.mockResolvedValue(1);
      redisService.decr.mockResolvedValue(-1);

      const result = await service.toggleLike(craftId, userId);

      expect(result.likeCount).toBe(0);
      expect(craftRepo.update).toHaveBeenCalledWith(craftId, {
        like_count: 0,
      });
    });

    it('should handle concurrent likes correctly (toggle twice)', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());

      // First call: like
      redisClient.sismember.mockResolvedValue(0);
      redisService.incr.mockResolvedValue(11);

      const result1 = await service.toggleLike(craftId, userId);
      expect(result1.liked).toBe(true);
      expect(result1.likeCount).toBe(11);

      // Second call: unlike
      redisClient.sismember.mockResolvedValue(1);
      redisService.decr.mockResolvedValue(10);

      const result2 = await service.toggleLike(craftId, userId);
      expect(result2.liked).toBe(false);
      expect(result2.likeCount).toBe(10);
    });
  });

  describe('isLiked', () => {
    it('should return true when user has liked the craft', async () => {
      redisClient.sismember.mockResolvedValue(1);

      const result = await service.isLiked('craft-uuid-1', 'user-uuid-1');

      expect(result).toBe(true);
    });

    it('should return false when user has not liked the craft', async () => {
      redisClient.sismember.mockResolvedValue(0);

      const result = await service.isLiked('craft-uuid-1', 'user-uuid-1');

      expect(result).toBe(false);
    });
  });

  describe('createComment', () => {
    const craftId = 'craft-uuid-1';
    const userId = 'user-uuid-1';
    const dto: CreateCommentDto = {
      content: '好漂亮的手工作品！',
    };

    it('should create a visitor comment', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());
      userRepo.findOne.mockResolvedValue(mockUser());
      const createdComment = mockComment();
      commentRepo.create.mockReturnValue(createdComment);
      commentRepo.save.mockResolvedValue(createdComment);

      const result = await service.createComment(
        craftId,
        userId,
        dto,
        'visitor',
      );

      expect(result.author_type).toBe(AuthorType.VISITOR);
      expect(result.content).toBe('好漂亮的手工作品！');
      expect(commentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          craft_id: craftId,
          content: dto.content,
          author_type: AuthorType.VISITOR,
          author_name: '手作爱好者',
        }),
      );
      expect(craftRepo.increment).toHaveBeenCalledWith(
        { id: craftId },
        'comment_count',
        1,
      );
    });

    it('should create an admin comment with ADMIN author_type', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());
      userRepo.findOne.mockResolvedValue(mockAdminUser());
      const createdComment = mockComment({ author_type: AuthorType.ADMIN });
      commentRepo.create.mockReturnValue(createdComment);
      commentRepo.save.mockResolvedValue(createdComment);

      const result = await service.createComment(
        craftId,
        'admin-uuid-1',
        dto,
        'admin',
      );

      expect(result.author_type).toBe(AuthorType.ADMIN);
    });

    it('should throw NotFoundException when craft not found', async () => {
      craftRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createComment(craftId, userId, dto, 'visitor'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user not found', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createComment(craftId, userId, dto, 'visitor'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a reply to a parent comment', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());
      userRepo.findOne.mockResolvedValue(mockUser());
      const parentComment = mockComment({ id: 'parent-uuid' });
      commentRepo.findOne.mockResolvedValue(parentComment);

      const replyDto: CreateCommentDto = {
        content: '谢谢夸奖！',
        parent_id: 'parent-uuid',
      };
      const replyComment = mockComment({
        id: 'reply-uuid',
        parent_id: 'parent-uuid',
        content: '谢谢夸奖！',
      });
      commentRepo.create.mockReturnValue(replyComment);
      commentRepo.save.mockResolvedValue(replyComment);

      const result = await service.createComment(
        craftId,
        userId,
        replyDto,
        'visitor',
      );

      expect(result.parent_id).toBe('parent-uuid');
    });

    it('should throw NotFoundException when parent comment does not exist', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft());
      userRepo.findOne.mockResolvedValue(mockUser());
      commentRepo.findOne.mockResolvedValue(null);

      const replyDto: CreateCommentDto = {
        content: '谢谢！',
        parent_id: 'non-existent',
      };

      await expect(
        service.createComment(craftId, userId, replyDto, 'visitor'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when parent comment belongs to different craft', async () => {
      craftRepo.findOne.mockResolvedValue(mockCraft({ id: craftId }));
      userRepo.findOne.mockResolvedValue(mockUser());
      const parentComment = mockComment({
        id: 'parent-uuid',
        craft_id: 'other-craft-uuid',
      });
      commentRepo.findOne.mockResolvedValue(parentComment);

      const replyDto: CreateCommentDto = {
        content: '谢谢！',
        parent_id: 'parent-uuid',
      };

      await expect(
        service.createComment(craftId, userId, replyDto, 'visitor'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findComments', () => {
    it('should return comments with cursor pagination', async () => {
      const comments = [
        mockComment({ id: 'c1', created_at: new Date('2025-01-15T10:00:00Z') }),
        mockComment({ id: 'c2', created_at: new Date('2025-01-14T10:00:00Z') }),
      ];

      const qb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(comments),
      };
      commentRepo.createQueryBuilder.mockReturnValue(qb);

      const query: CommentQueryDto = { limit: 20 };
      const result = await service.findComments('craft-uuid-1', query);

      expect(result.items).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it('should apply cursor when provided', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      commentRepo.createQueryBuilder.mockReturnValue(qb);

      const query: CommentQueryDto = {
        limit: 10,
        cursor: '2025-01-15T10:00:00.000Z',
      };
      await service.findComments('craft-uuid-1', query);

      expect(qb.andWhere).toHaveBeenCalledWith(
        'comment.created_at < :cursor',
        { cursor: new Date('2025-01-15T10:00:00.000Z') },
      );
    });

    it('should return hasMore=true when results exceed limit', async () => {
      const comments = Array.from({ length: 21 }, (_, i) =>
        mockComment({
          id: `c${i}`,
          created_at: new Date(`2025-01-${String(15 - Math.floor(i / 2)).padStart(2, '0')}T10:00:00Z`),
        }),
      );

      const qb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(comments),
      };
      commentRepo.createQueryBuilder.mockReturnValue(qb);

      const query: CommentQueryDto = { limit: 20 };
      const result = await service.findComments('craft-uuid-1', query);

      expect(result.items).toHaveLength(20);
      expect(result.hasMore).toBe(true);
    });

    it('should return empty list for craft with no comments', async () => {
      const qb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      commentRepo.createQueryBuilder.mockReturnValue(qb);

      const query: CommentQueryDto = {};
      const result = await service.findComments('craft-uuid-1', query);

      expect(result.items).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('deleteComment', () => {
    it('should allow admin to delete any comment', async () => {
      const comment = mockComment({ id: 'comment-uuid-1' });
      commentRepo.findOne.mockResolvedValue(comment);
      craftRepo.findOne.mockResolvedValue(mockCraft({ comment_count: 3 }));

      await service.deleteComment('comment-uuid-1', 'admin-uuid-1', 'admin');

      expect(commentRepo.remove).toHaveBeenCalledWith(comment);
      expect(craftRepo.decrement).toHaveBeenCalledWith(
        { id: 'craft-uuid-1' },
        'comment_count',
        1,
      );
    });

    it('should allow comment author to delete own comment', async () => {
      const comment = mockComment({
        id: 'comment-uuid-1',
        author_id: 'user-uuid-1',
      });
      commentRepo.findOne.mockResolvedValue(comment);
      craftRepo.findOne.mockResolvedValue(mockCraft({ comment_count: 3 }));

      await service.deleteComment('comment-uuid-1', 'user-uuid-1', 'visitor');

      expect(commentRepo.remove).toHaveBeenCalledWith(comment);
    });

    it('should throw ForbiddenException when non-author visitor tries to delete', async () => {
      const comment = mockComment({
        id: 'comment-uuid-1',
        author_id: 'other-user-uuid',
      });
      commentRepo.findOne.mockResolvedValue(comment);

      await expect(
        service.deleteComment('comment-uuid-1', 'user-uuid-1', 'visitor'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      commentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.deleteComment('non-existent', 'user-uuid-1', 'visitor'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not decrement comment_count below 0', async () => {
      const comment = mockComment({ id: 'comment-uuid-1' });
      commentRepo.findOne.mockResolvedValue(comment);
      craftRepo.findOne.mockResolvedValue(mockCraft({ comment_count: 0 }));

      await service.deleteComment('comment-uuid-1', 'admin-uuid-1', 'admin');

      expect(craftRepo.decrement).not.toHaveBeenCalled();
    });

    it('should not decrement when craft not found', async () => {
      const comment = mockComment({ id: 'comment-uuid-1' });
      commentRepo.findOne.mockResolvedValue(comment);
      craftRepo.findOne.mockResolvedValue(null);

      await service.deleteComment('comment-uuid-1', 'admin-uuid-1', 'admin');

      expect(craftRepo.decrement).not.toHaveBeenCalled();
    });
  });

  describe('replyAsAuthor', () => {
    const commentId = 'comment-uuid-1';
    const adminUserId = 'admin-uuid-1';
    const dto: ReplyCommentDto = { content: '感谢你的喜欢！' };

    it('should create an author reply', async () => {
      const parentComment = mockComment({ id: commentId });
      commentRepo.findOne.mockResolvedValue(parentComment);
      userRepo.findOne.mockResolvedValue(mockAdminUser());

      const replyComment = mockComment({
        id: 'reply-uuid',
        parent_id: commentId,
        content: '感谢你的喜欢！',
        author_type: AuthorType.ADMIN,
        author_name: '管理员',
        is_author_reply: true,
        author_id: adminUserId,
      });
      commentRepo.create.mockReturnValue(replyComment);
      commentRepo.save.mockResolvedValue(replyComment);

      const result = await service.replyAsAuthor(commentId, adminUserId, dto);

      expect(result.is_author_reply).toBe(true);
      expect(result.author_type).toBe(AuthorType.ADMIN);
      expect(result.content).toBe('感谢你的喜欢！');
      expect(commentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parent_id: commentId,
          craft_id: parentComment.craft_id,
          is_author_reply: true,
        }),
      );
      expect(craftRepo.increment).toHaveBeenCalledWith(
        { id: parentComment.craft_id },
        'comment_count',
        1,
      );
    });

    it('should throw NotFoundException when parent comment not found', async () => {
      commentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.replyAsAuthor(commentId, adminUserId, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when admin user not found', async () => {
      commentRepo.findOne.mockResolvedValue(mockComment());
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.replyAsAuthor(commentId, adminUserId, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should use admin avatar when available', async () => {
      const parentComment = mockComment({ id: commentId });
      commentRepo.findOne.mockResolvedValue(parentComment);
      const admin = mockAdminUser({
        id: adminUserId,
        avatar_url: 'https://example.com/admin-avatar.jpg',
      });
      userRepo.findOne.mockResolvedValue(admin);

      const replyComment = mockComment({
        id: 'reply-uuid',
        author_avatar: 'https://example.com/admin-avatar.jpg',
      });
      commentRepo.create.mockReturnValue(replyComment);
      commentRepo.save.mockResolvedValue(replyComment);

      const result = await service.replyAsAuthor(commentId, adminUserId, dto);

      expect(result.author_avatar).toBe('https://example.com/admin-avatar.jpg');
    });
  });
});