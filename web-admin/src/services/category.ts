import { get, post, put, del } from '@/utils/request';

export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export async function getCategories(): Promise<Category[]> {
  return get<Category[]>('/admin/categories');
}

export async function createCategory(data: { name: string; icon?: string; sort_order?: number }): Promise<Category> {
  return post<Category>('/admin/categories', data);
}

export async function updateCategory(id: string, data: Partial<{ name: string; icon: string; sort_order: number }>): Promise<Category> {
  return put<Category>(`/admin/categories/${id}`, data);
}

export async function deleteCategory(id: string): Promise<void> {
  return del(`/admin/categories/${id}`);
}

export async function reorderCategories(ids: string[]): Promise<void> {
  return put('/admin/categories/reorder', { ids });
}
