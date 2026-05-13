import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW Browser Worker
 * 开发阶段在浏览器中拦截API请求返回Mock数据
 * 在 main.tsx 中调用 await worker.start() 启动
 */
export const worker = setupWorker(...handlers);
