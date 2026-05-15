Page({
  data: {
    craft: null,
    loading: true,
  },

  onLoad(options) {
    const { id } = options;
    // TODO: 加载作品详情
  },

  onShareAppMessage() {
    // TODO: 自定义分享卡片
    return {
      title: '来看我的手作',
      path: `/pages-detail/detail/detail?id=${this.data.craft?.id}`,
    };
  },
});
