import { post, get, put } from '@/utils/request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  mustChangePassword: boolean;
}

export interface AdminInfo {
  id: string;
  nickname: string;
  avatar_url: string;
  role: string;
  must_change_password: boolean;
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

export async function login(params: LoginParams): Promise<LoginResult> {
  return post<LoginResult>('/admin/auth/login', params);
}

export async function getAdminInfo(): Promise<AdminInfo> {
  return get<AdminInfo>('/admin/auth/me');
}

export async function changePassword(params: ChangePasswordParams): Promise<void> {
  return put('/admin/auth/password', params);
}
