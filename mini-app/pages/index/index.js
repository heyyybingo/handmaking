const { request } = require('../../utils/request');

Page({
  data: {
    crafts: [],
    categories: [],
    activeCategory: 'all',
    loading: true,
    loadingMore: false,
    hasMore: true,
    cursor: null,
  },

  onLoad() {
    this.loadCategories();
    this.loadCrafts();
  },

  onPullDownRefresh() {
    this.setData({ crafts: [], cursor: null, hasMore: true });
    this.loadCrafts().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadCrafts();
    }
  },

  async loadCategories() {
    try {
      const categories = await request({ url: '/mini/categories' });
      this.setData({ categories: [{ id: 'all', name: '全部', icon: '✨' }, ...categories] });
    } catch (err) {
      console.error('加载分类失败:', err);
    }
  },

  async loadCrafts() {
    if (this.data.loadingMore) return;

    this.setData({ loadingMore: true });

    try {
      const params = { limit: 20 };
      if (this.data.cursor) params.cursor = this.data.cursor;
      if (this.data.activeCategory !== 'all') params.category_id = this.data.activeCategory;

      const res = await request({ url: '/mini/crafts', data: params });

      this.setData({
        crafts: [...this.data.crafts, ...res.items],
        cursor: res.nextCursor,
        hasMore: !!res.nextCursor,
        loading: false,
      });
    } catch (err) {
      console.error('加载作品失败:', err);
    } finally {
      this.setData({ loadingMore: false });
    }
  },

  onCategoryTap(e) {
    const { id } = e.currentTarget.dataset;
    if (id === this.data.activeCategory) return;

    this.setData({
      activeCategory: id,
      crafts: [],
      cursor: null,
      hasMore: true,
      loading: true,
    });

    this.loadCrafts();
  },

  onCraftTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages-detail/detail/detail?id=${id}`,
    });
  },
});
