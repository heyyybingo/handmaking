import { get, put } from '@/utils/request';

export interface Intent {
  id: string;
  craft_id: string;
  craft_title?: string;
  type: 'want_collect' | 'want_custom' | 'want_know_more';
  message: string;
  visitor_name: string;
  visitor_contact: string;
  status: 'pending' | 'viewed' | 'replied';
  created_at: string;
}

export interface IntentListParams {
  cursor?: string;
  limit?: number;
  type?: string;
  status?: string;
}

export interface IntentListResult {
  items: Intent[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface IntentStats {
  total: number;
  todayNew: number;
  pending: number;
  byType: {
    want_collect: number;
    want_custom: number;
    want_know_more: number;
  };
}

export async function getIntents(params?: IntentListParams): Promise<IntentListResult> {
  return get<IntentListResult>('/admin/intents', { params });
}

export async function updateIntentStatus(id: string, status: string): Promise<void> {
  return put(`/admin/intents/${id}/status`, { status });
}

export async function getIntentStats(): Promise<IntentStats> {
  return get<IntentStats>('/admin/intents/stats');
}
