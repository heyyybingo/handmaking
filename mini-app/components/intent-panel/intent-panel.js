const { request } = require('../../utils/request');

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    craftId: {
      type: String,
      value: '',
    },
  },

  data: {
    selectedType: '',
    message: '',
    submitting: false,
    types: [
      { value: 'want_collect', label: '❤️ 喜欢想收藏', desc: '表达对作品的喜爱' },
      { value: 'want_custom', label: '🎨 想定制类似的', desc: '希望定制同款作品' },
      { value: 'want_know_more', label: '💬 想了解更多', desc: '对作品有更多疑问' },
    ],
  },

  methods: {
    onTypeSelect(e) {
      const { value } = e.currentTarget.dataset;
      this.setData({ selectedType: value });
    },

    onMessageInput(e) {
      this.setData({ message: e.detail.value });
    },

    async onSubmit() {
      const { selectedType, message, craftId, submitting } = this.data;
      if (submitting) return;

      if (!selectedType) {
        wx.showToast({ title: '请选择意向类型', icon: 'none' });
        return;
      }

      this.setData({ submitting: true });

      try {
        await request({
          url: `/mini/crafts/${craftId}/intent`,
          method: 'POST',
          data: {
            type: selectedType,
            message: message.slice(0, 200),
          },
        });

        wx.showToast({ title: '已收到你的心意', icon: 'success' });
        this.setData({ selectedType: '', message: '' });
        this.triggerEvent('success');
      } catch (err) {
        if (err.message?.includes('已提交')) {
          wx.showToast({ title: '你已经提交过意向了', icon: 'none' });
        } else {
          wx.showToast({ title: '提交失败', icon: 'none' });
        }
      } finally {
        this.setData({ submitting: false });
      }
    },

    onClose() {
      this.triggerEvent('close');
    },
  },
});
