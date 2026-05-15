App({
  globalData: {
    token: null,
    userInfo: null,
    hasProfile: false,
  },

  onLaunch() {
    this.silentLogin();
  },

  async silentLogin() {
    try {
      const { code } = await wx.login();
      // TODO: 调用后端 /api/mini/auth/login 接口换取 token
      // const res = await request({ url: '/mini/auth/login', method: 'POST', data: { code } });
      // this.globalData.token = res.accessToken;
      // this.globalData.hasProfile = res.hasProfile;
      console.log('静默登录 code:', code);
    } catch (err) {
      console.error('静默登录失败:', err);
    }
  },
});
