Component({
  properties: {
    active: {
      type: String,
      value: 'index',
    },
  },

  data: {
    tabs: [
      { key: 'index', icon: '🏠', activeIcon: '🏠', text: '首页' },
      { key: 'category', icon: '📂', activeIcon: '📂', text: '分类' },
      { key: 'profile', icon: '👤', activeIcon: '👤', text: '我的' },
    ],
  },

  methods: {
    onTabTap(e) {
      const { key } = e.currentTarget.dataset;
      if (key === this.data.active) return;

      const url = key === 'index'
        ? '/pages/index/index'
        : `/pages/${key}/${key}`;

      wx.switchTab({ url });
    },
  },
});
