const { request } = require('../../utils/request');

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    avatarUrl: '',
    nickname: '',
    submitting: false,
  },

  methods: {
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail;
      this.setData({ avatarUrl });
    },

    onNicknameInput(e) {
      this.setData({ nickname: e.detail.value });
    },

    async onConfirm() {
      if (this.data.submitting) return;

      const { avatarUrl, nickname } = this.data;
      if (!nickname) {
        wx.showToast({ title: '请输入昵称', icon: 'none' });
        return;
      }

      this.setData({ submitting: true });

      try {
        // 上传头像
        let finalAvatarUrl = avatarUrl;
        if (avatarUrl && avatarUrl.startsWith('wxfile://')) {
          const uploadRes = await new Promise((resolve, reject) => {
            wx.uploadFile({
              url: 'https://your-api-domain.com/api/mini/auth/avatar',
              filePath: avatarUrl,
              name: 'file',
              header: {
                Authorization: `Bearer ${getApp().globalData.token}`,
              },
              success: resolve,
              fail: reject,
            });
          });
          finalAvatarUrl = JSON.parse(uploadRes.data).url;
        }

        // 更新用户信息
        await request({
          url: '/mini/auth/profile',
          method: 'PUT',
          data: {
            avatarUrl: finalAvatarUrl,
            nickname,
          },
        });

        const app = getApp();
        app.globalData.hasProfile = true;
        app.globalData.userInfo = {
          avatar_url: finalAvatarUrl,
          nickname,
        };

        wx.showToast({ title: '保存成功', icon: 'success' });
        this.triggerEvent('success');
      } catch (err) {
        wx.showToast({ title: '保存失败', icon: 'none' });
      } finally {
        this.setData({ submitting: false });
      }
    },

    onSkip() {
      const app = getApp();
      app.globalData.hasProfile = true;
      this.triggerEvent('skip');
    },

    onClose() {
      this.triggerEvent('close');
    },
  },
});
