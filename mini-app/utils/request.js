const MOCK_MODE = false;

const BASE_URL = 'https://your-api-domain.com/api';

/**
 * 请求工具类
 * 自动携带 Token、401 触发静默登录重试、403 提示无权限
 */
async function request(options) {
  const { url, method = 'GET', data, header = {} } = options;

  const app = getApp();
  if (app.globalData.token) {
    header.Authorization = `Bearer ${app.globalData.token}`;
  }

  if (MOCK_MODE) {
    // TODO: 返回 Mock 数据
    return {};
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header,
      success: (res) => {
        if (res.statusCode === 401) {
          // Token 过期，尝试静默登录重试
          app.silentLogin().then(() => {
            request(options).then(resolve).catch(reject);
          });
          return;
        }
        if (res.statusCode === 403) {
          wx.showToast({ title: '无权限访问', icon: 'none' });
          reject(new Error('无权限'));
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
      fail: (err) => {
        wx.showToast({ title: '网络异常', icon: 'none' });
        reject(err);
      },
    });
  });
}

module.exports = { request };
