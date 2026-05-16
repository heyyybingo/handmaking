const MOCK_MODE = false;

const BASE_URL = 'https://your-api-domain.com/api';

const MAX_RETRY = 2;
const RETRY_DELAY = 1000;

let _retryCount = 0;
let _lastError = null;

/**
 * 请求工具类
 * 自动携带 Token、401 触发静默登录重试、403 提示无权限、网络异常重试、Mock 模式支持
 */
async function request(options) {
  const { url, method = 'GET', data, header = {}, skipAuth = false } = options;

  const app = getApp();

  // 确保 Token 有效
  if (!skipAuth) {
    await app.ensureValidToken();
  }

  // 自动携带 Token
  if (!skipAuth && app.globalData.token) {
    header.Authorization = `Bearer ${app.globalData.token}`;
  }

  if (MOCK_MODE) {
    return getMockData(url, method, data);
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header,
      success: async (res) => {
        _retryCount = 0;

        if (res.statusCode === 401) {
          // Token 过期，尝试刷新重试
          try {
            await app.refreshAccessToken();
            header.Authorization = `Bearer ${app.globalData.token}`;
            const retryRes = await request({ url, method, data, header, skipAuth });
            resolve(retryRes);
          } catch (err) {
            reject(err);
          }
          return;
        }

        if (res.statusCode === 403) {
          wx.showToast({ title: '无权限访问', icon: 'none' });
          reject(new Error('无权限'));
          return;
        }

        if (res.statusCode >= 500) {
          const msg = '服务器异常，请稍后再试';
          wx.showToast({ title: msg, icon: 'none' });
          reject(new Error(msg));
          return;
        }

        if (res.statusCode >= 400) {
          const msg = res.data?.message || '请求失败';
          wx.showToast({ title: msg, icon: 'none' });
          reject(new Error(msg));
          return;
        }

        resolve(res.data);
      },
      fail: async (err) => {
        // 网络异常重试
        if (_retryCount < MAX_RETRY) {
          _retryCount++;
          await delay(RETRY_DELAY * _retryCount);
          try {
            const retryRes = await request(options);
            resolve(retryRes);
          } catch (retryErr) {
            reject(retryErr);
          }
          return;
        }

        _retryCount = 0;
        const msg = '网络异常，请检查网络连接';
        wx.showToast({ title: msg, icon: 'none' });
        _lastError = { time: Date.now(), message: msg };
        reject(new Error(msg));
      },
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 获取最近的错误信息
 */
function getLastError() {
  return _lastError;
}

/**
 * Mock 数据
 */
function getMockData(url, method, data) {
  // 作品列表
  if (url.includes('/mini/crafts') && method === 'GET' && !url.includes('/')) {
    return Promise.resolve({
      items: [
        {
          id: '1',
          title: '复古皮革手工挎包',
          images: [{ url: 'https://picsum.photos/400/300?random=1', thumbnailUrl: 'https://picsum.photos/200/150?random=1' }],
          category: { id: '1', name: '皮具' },
          tags: ['手工皮具', '复古'],
          like_count: 128,
          comment_count: 32,
        },
        {
          id: '2',
          title: '手绘陶瓷花瓶',
          images: [{ url: 'https://picsum.photos/400/300?random=2', thumbnailUrl: 'https://picsum.photos/200/150?random=2' }],
          category: { id: '2', name: '陶艺' },
          tags: ['陶瓷', '手绘'],
          like_count: 86,
          comment_count: 18,
        },
      ],
      nextCursor: null,
    });
  }

  // 作品详情
  if (url.match(/\/mini\/crafts\/.+/) && method === 'GET') {
    return Promise.resolve({
      id: '1',
      title: '复古皮革手工挎包',
      description: '<p>这是一款精心手工制作的复古皮革挎包...</p>',
      images: [
        { url: 'https://picsum.photos/800/600?random=1', thumbnailUrl: 'https://picsum.photos/400/300?random=1' },
      ],
      category: { id: '1', name: '皮具' },
      tags: ['手工皮具', '复古'],
      like_count: 128,
      comment_count: 32,
      intent_count: 12,
      created_at: '2024-01-15T10:30:00Z',
    });
  }

  // 分类列表
  if (url.includes('/mini/categories') && method === 'GET') {
    return Promise.resolve([
      { id: '1', name: '皮具', icon: '👜', craft_count: 15 },
      { id: '2', name: '陶艺', icon: '🏺', craft_count: 23 },
      { id: '3', name: '编织', icon: '🧶', craft_count: 18 },
      { id: '4', name: '木工', icon: '🪵', craft_count: 12 },
      { id: '5', name: '刺绣', icon: '🧵', craft_count: 9 },
    ]);
  }

  // 登录
  if (url.includes('/mini/auth/login') && method === 'POST') {
    return Promise.resolve({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      hasProfile: false,
      userInfo: null,
    });
  }

  // 点赞
  if (url.includes('/like') && method === 'POST') {
    return Promise.resolve({ like_count: 129, liked: true });
  }

  if (url.includes('/like') && method === 'DELETE') {
    return Promise.resolve({ like_count: 127, liked: false });
  }

  // 评论
  if (url.includes('/comments') && method === 'GET') {
    return Promise.resolve({
      items: [
        {
          id: 'c1',
          content: '太好看了！',
          author_name: '手工爱好者',
          author_avatar: '',
          is_author_reply: false,
          created_at: '2024-01-16T08:00:00Z',
        },
      ],
      nextCursor: null,
    });
  }

  // 默认返回空对象
  return Promise.resolve({});
}

module.exports = { request, getLastError };
