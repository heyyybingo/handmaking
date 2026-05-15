import { get, post, put, del } from '@/utils/request';

export interface Craft {
  id: string;
  title: string;
  description: string;
  images: { url: string; thumbnailUrl: string; width: number; height: number; sort: number }[];
  video: { url: string; coverUrl: string; duration: number } | null;
  category_id: string;
  category: { id: string; name: string };
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  like_count: number;
  comment_count: number;
  intent_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CraftListParams {
  cursor?: string;
  limit?: number;
  category_id?: string;
  status?: string;
}

export interface CraftListResult {
  items: Craft[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreateCraftParams {
  title: string;
  description?: string;
  images?: { url: string; thumbnailUrl: string; width: number; height: number; sort: number }[];
  video?: { url: string; coverUrl: string; duration: number };
  category_id: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  sort_order?: number;
}

export interface BatchActionParams {
  ids: string[];
  action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'move_category';
  category_id?: string;
}

export interface PresignResult {
  url: string;
  key: string;
}

export interface ConfirmResult {
  url: string;
}

export async function getCrafts(params?: CraftListParams): Promise<CraftListResult> {
  return get<CraftListResult>('/admin/crafts', { params });
}

export async function getCraft(id: string): Promise<Craft> {
  return get<Craft>(`/admin/crafts/${id}`);
}

export async function createCraft(data: CreateCraftParams): Promise<Craft> {
  return post<Craft>('/admin/crafts', data);
}

export async function updateCraft(id: string, data: Partial<CreateCraftParams>): Promise<Craft> {
  return put<Craft>(`/admin/crafts/${id}`, data);
}

export async function deleteCraft(id: string): Promise<void> {
  return del(`/admin/crafts/${id}`);
}

export async function batchAction(data: BatchActionParams): Promise<void> {
  return post('/admin/crafts/batch', data);
}

export async function getPresignedUrl(data: { filename: string; fileType: 'image' | 'video' }): Promise<PresignResult> {
  return post<PresignResult>('/admin/files/presign', data);
}

export async function confirmUpload(data: { key: string }): Promise<ConfirmResult> {
  return post<ConfirmResult>('/admin/files/confirm', data);
}
