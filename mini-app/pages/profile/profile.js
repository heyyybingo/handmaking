Page({
  data: {
    userInfo: null,
    hasProfile: false,
  },

  onShow() {
    const app = getApp();
    this.setData({
      hasProfile: app.globalData.hasProfile,
    });
  },
});
