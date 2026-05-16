const { request } = require('../../utils/request');

Page({
  data: {
    categories: [],
    selectedCategory: null,
    crafts: [],
    loading: true,
    loadingMore: false,
    hasMore: true,
    cursor: null,
  },

  onLoad() {
    this.loadCategories();
  },

  async loadCategories() {
    try {
      const categories = await request({ url: '/mini/categories' });
      this.setData({ categories });
      if (categories.length > 0) {
        this.selectCategory(categories[0]);
      }
    } catch (err) {
      console.error('加载分类失败:', err);
    }
  },

  selectCategory(category) {
    this.setData({
      selectedCategory: category,
      crafts: [],
      cursor: null,
      hasMore: true,
      loading: true,
    });
    this.loadCrafts();
  },

  onCategoryTap(e) {
    const { index } = e.currentTarget.dataset;
    this.selectCategory(this.data.categories[index]);
  },

  async loadCrafts() {
    if (this.data.loadingMore || !this.data.selectedCategory) return;

    this.setData({ loadingMore: true });

    try {
      const params = {
        category_id: this.data.selectedCategory.id,
        limit: 20,
      };
      if (this.data.cursor) params.cursor = this.data.cursor;

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

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadCrafts();
    }
  },

  onCraftTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages-detail/detail/detail?id=${id}`,
    });
  },
});
