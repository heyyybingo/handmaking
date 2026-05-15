import { get, post, del } from '@/utils/request';

export interface Comment {
  id: string;
  craft_id: string;
  craft_title?: string;
  parent_id: string | null;
  content: string;
  author_type: 'admin' | 'visitor';
  author_name: string;
  author_avatar: string;
  is_author_reply: boolean;
  created_at: string;
}

export interface CommentListParams {
  cursor?: string;
  limit?: number;
  craft_id?: string;
}

export interface CommentListResult {
  items: Comment[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function getComments(params?: CommentListParams): Promise<CommentListResult> {
  return get<CommentListResult>('/admin/comments', { params });
}

export async function replyComment(id: string, data: { content: string }): Promise<Comment> {
  return post<Comment>(`/admin/comments/${id}/reply`, data);
}

export async function deleteComment(id: string): Promise<void> {
  return del(`/admin/comments/${id}`);
}
