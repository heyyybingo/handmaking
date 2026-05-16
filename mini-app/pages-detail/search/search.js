const { request } = require('../../utils/request');

Page({
  data: {
    keyword: '',
    results: [],
    history: [],
    loading: false,
    searched: false,
  },

  onLoad() {
    this.loadHistory();
  },

  loadHistory() {
    try {
      const history = wx.getStorageSync('searchHistory') || [];
      this.setData({ history });
    } catch (err) {
      console.error('加载搜索历史失败:', err);
    }
  },

  saveHistory(keyword) {
    if (!keyword.trim()) return;

    let history = this.data.history.filter(h => h !== keyword);
    history.unshift(keyword);
    history = history.slice(0, 20); // 最多保留20条

    this.setData({ history });
    wx.setStorageSync('searchHistory', history);
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    const { keyword } = this.data;
    if (!keyword.trim()) return;

    this.saveHistory(keyword);
    this.doSearch(keyword);
  },

  onHistoryTap(e) {
    const { keyword } = e.currentTarget.dataset;
    this.setData({ keyword });
    this.saveHistory(keyword);
    this.doSearch(keyword);
  },

  onClearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ history: [] });
          wx.removeStorageSync('searchHistory');
        }
      },
    });
  },

  async doSearch(keyword) {
    this.setData({ loading: true, searched: true });

    try {
      const res = await request({
        url: '/mini/crafts/search',
        data: { keyword, limit: 20 },
      });
      this.setData({ results: res.items || [] });
    } catch (err) {
      console.error('搜索失败:', err);
      wx.showToast({ title: '搜索失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onCraftTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages-detail/detail/detail?id=${id}`,
    });
  },

  onClearKeyword() {
    this.setData({ keyword: '', results: [], searched: false });
  },
});
