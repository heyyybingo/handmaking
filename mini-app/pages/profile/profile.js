const { request } = require('../../utils/request');

Page({
  data: {
    userInfo: null,
    hasProfile: false,
    loading: true,
    myCrafts: [],
    craftsLoading: false,
    hasMoreCrafts: true,
    cursor: null,
    stats: {
      likeCount: 0,
      followCount: 0,
      commentCount: 0,
    },
  },

  onShow() {
    const app = getApp();
    this.setData({
      hasProfile: app.globalData.hasProfile,
      userInfo: app.globalData.userInfo,
    });

    if (app.globalData.token) {
      this.loadUserInfo();
      this.loadMyCrafts();
      this.loadStats();
    } else {
      this.setData({ loading: false });
    }
  },

  async loadUserInfo() {
    try {
      const res = await request({ url: '/mini/auth/profile' });
      const app = getApp();
      app.globalData.userInfo = res;
      app.globalData.hasProfile = res.has_profile;
      this.setData({
        userInfo: res,
        hasProfile: res.has_profile,
        loading: false,
      });
    } catch (err) {
      console.error('加载用户信息失败:', err);
      this.setData({ loading: false });
    }
  },

  async loadStats() {
    try {
      const res = await request({ url: '/mini/user/stats' });
      this.setData({
        stats: {
          likeCount: res.like_count || 0,
          followCount: res.follow_count || 0,
          commentCount: res.comment_count || 0,
        },
      });
    } catch (err) {
      console.error('加载统计数据失败:', err);
    }
  },

  async loadMyCrafts() {
    if (this.data.craftsLoading) return;
    this.setData({ craftsLoading: true });

    try {
      const params = { limit: 20 };
      if (this.data.cursor) params.cursor = this.data.cursor;

      const res = await request({ url: '/mini/crafts', data: params });

      this.setData({
        myCrafts: [...this.data.myCrafts, ...res.items],
        cursor: res.nextCursor,
        hasMoreCrafts: !!res.nextCursor,
      });
    } catch (err) {
      console.error('加载我的作品失败:', err);
    } finally {
      this.setData({ craftsLoading: false });
    }
  },

  onPullDownRefresh() {
    this.setData({ myCrafts: [], cursor: null, hasMoreCrafts: true });
    Promise.all([this.loadUserInfo(), this.loadMyCrafts()]).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMoreCrafts && !this.data.craftsLoading) {
      this.loadMyCrafts();
    }
  },

  onTapProfile() {
    if (!this.data.hasProfile) {
      this.setData({ showProfilePanel: true });
    }
  },

  onProfilePanelClose() {
    this.setData({ showProfilePanel: false });
  },

  onProfilePanelSuccess() {
    this.setData({ showProfilePanel: false });
    this.loadUserInfo();
  },

  onCraftTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages-detail/detail/detail?id=${id}`,
    });
  },

  onLogin() {
    wx.navigateTo({ url: '/pages-detail/search/search' });
  },
});
