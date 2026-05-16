const { request } = require('./utils/request');

App({
  globalData: {
    token: null,
    refreshToken: null,
    userInfo: null,
    hasProfile: false,
    tokenExpiry: 0,
  },

  onLaunch() {
    this.loadTokenFromStorage();
    this.silentLogin();
  },

  // 从本地存储加载 Token
  loadTokenFromStorage() {
    try {
      const token = wx.getStorageSync('token');
      const refreshToken = wx.getStorageSync('refreshToken');
      const tokenExpiry = wx.getStorageSync('tokenExpiry');

      if (token && refreshToken) {
        this.globalData.token = token;
        this.globalData.refreshToken = refreshToken;
        this.globalData.tokenExpiry = tokenExpiry || 0;
      }
    } catch (err) {
      console.error('加载 Token 失败:', err);
    }
  },

  // 保存 Token 到本地存储
  saveTokenToStorage(token, refreshToken, expiresIn) {
    const expiry = Date.now() + expiresIn * 1000;
    this.globalData.token = token;
    this.globalData.refreshToken = refreshToken;
    this.globalData.tokenExpiry = expiry;

    try {
      wx.setStorageSync('token', token);
      wx.setStorageSync('refreshToken', refreshToken);
      wx.setStorageSync('tokenExpiry', expiry);
    } catch (err) {
      console.error('保存 Token 失败:', err);
    }
  },

  // 清除 Token
  clearToken() {
    this.globalData.token = null;
    this.globalData.refreshToken = null;
    this.globalData.tokenExpiry = 0;
    this.globalData.userInfo = null;
    this.globalData.hasProfile = false;

    try {
      wx.removeStorageSync('token');
      wx.removeStorageSync('refreshToken');
      wx.removeStorageSync('tokenExpiry');
    } catch (err) {
      console.error('清除 Token 失败:', err);
    }
  },

  // 检查 Token 是否需要刷新（过期前1天）
  isTokenExpiringSoon() {
    if (!this.globalData.tokenExpiry) return false;
    const oneDayMs = 24 * 60 * 60 * 1000;
    return Date.now() > this.globalData.tokenExpiry - oneDayMs;
  },

  // 静默登录
  async silentLogin() {
    try {
      const { code } = await wx.login();

      const res = await request({
        url: '/mini/auth/login',
        method: 'POST',
        data: { code },
        skipAuth: true,
      });

      if (res.accessToken) {
        this.saveTokenToStorage(res.accessToken, res.refreshToken, 7 * 24 * 60 * 60);
        this.globalData.hasProfile = res.hasProfile;

        if (res.userInfo) {
          this.globalData.userInfo = res.userInfo;
        }
      }
    } catch (err) {
      console.error('静默登录失败:', err);
    }
  },

  // 刷新 Token
  async refreshAccessToken() {
    if (!this.globalData.refreshToken) {
      await this.silentLogin();
      return;
    }

    try {
      const res = await request({
        url: '/mini/auth/refresh',
        method: 'POST',
        data: { refreshToken: this.globalData.refreshToken },
        skipAuth: true,
      });

      if (res.accessToken) {
        this.saveTokenToStorage(res.accessToken, res.refreshToken, 7 * 24 * 60 * 60);
      }
    } catch (err) {
      console.error('刷新 Token 失败:', err);
      this.clearToken();
      await this.silentLogin();
    }
  },

  // 确保 Token 有效
  async ensureValidToken() {
    if (!this.globalData.token) {
      await this.silentLogin();
    } else if (this.isTokenExpiringSoon()) {
      await this.refreshAccessToken();
    }
  },
});
