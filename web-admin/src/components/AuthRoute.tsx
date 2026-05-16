import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AuthRouteProps {
  children: ReactNode;
}

/**
 * 认证路由守卫组件
 * 检查 localStorage 中是否存在 admin_token
 * 如果未认证，重定向到 /login
 */
export default function AuthRoute({ children }: AuthRouteProps) {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}