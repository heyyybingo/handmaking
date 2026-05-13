import { http, HttpResponse } from 'msw';

/**
 * MSW 请求处理器
 * 拦截API请求并返回Mock数据，开发阶段前后端并行开发使用
 * 各业务模块在此数组中添加自己的handler
 */
export const handlers = [
  // 健康检查 Mock
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }),
];
