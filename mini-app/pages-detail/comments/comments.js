Page({
  data: {
    comments: [],
    craftId: '',
  },

  onLoad(options) {
    const { craftId } = options;
    this.setData({ craftId });
    // TODO: 加载评论列表
  },
});
