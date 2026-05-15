import { get, put } from '@/utils/request';

export interface DashboardStats {
  totalCrafts: number;
  totalLikes: number;
  totalComments: number;
  totalIntents: number;
  todayVisitors: number;
  trends: {
    crafts: { date: string; value: number }[];
    likes: { date: string; value: number }[];
    comments: { date: string; value: number }[];
    intents: { date: string; value: number }[];
  };
}

export interface SystemConfigs {
  [key: string]: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return get<DashboardStats>('/admin/dashboard/stats');
}

export async function getSystemConfigs(): Promise<SystemConfigs> {
  return get<SystemConfigs>('/admin/config');
}

export async function updateSystemConfigs(configs: { key: string; value: string }[]): Promise<SystemConfigs> {
  return put<SystemConfigs>('/admin/config', { configs });
}
