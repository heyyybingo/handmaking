const { request } = require('../../utils/request');
const { checkIntercept, getPendingCallback, executePending, cancelPending } = require('../../utils/intercept');

Page({
  data: {
    craft: null,
    loading: true,
    liked: false,
    showCommentInput: false,
    commentText: '',
    comments: [],
    showIntentPanel: false,
    showProfilePanel: false,
    showPoster: false,
    replyTo: null,
    immersiveOpacity: 1,
    infoOpacity: 0,
    statusBarHeight: 0,
  },

  onLoad(options) {
    const { id } = options;
    this.craftId = id;
    this.loadCraftDetail();
    this.loadComments();

    const sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight });
  },

  onPageScroll(e) {
    const scrollTop = e.scrollTop;
    const swiperHeight = 400;
    const ratio = Math.min(scrollTop / swiperHeight, 1);
    this.setData({
      immersiveOpacity: 1 - ratio,
      infoOpacity: Math.min(ratio * 2, 1),
    });
  },

  onShareAppMessage() {
    const { craft } = this.data;
    return {
      title: craft?.title || '来看我的手作',
      path: `/pages-detail/detail/detail?id=${this.craftId}`,
      imageUrl: craft?.images?.[0]?.thumbnailUrl,
    };
  },

  async loadCraftDetail() {
    try {
      const craft = await request({ url: `/mini/crafts/${this.craftId}` });
      this.setData({ craft, loading: false });
    } catch (err) {
      console.error('加载作品详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async loadComments() {
    try {
      const res = await request({ url: `/mini/crafts/${this.craftId}/comments` });
      this.setData({ comments: res.items || [] });
    } catch (err) {
      console.error('加载评论失败:', err);
    }
  },

  async onLikeTap() {
    if (checkIntercept(() => this.onLikeTap())) {
      this.setData({ showProfilePanel: true });
      return;
    }

    const { craft, liked } = this.data;
    try {
      const method = liked ? 'DELETE' : 'POST';
      const res = await request({
        url: `/mini/crafts/${this.craftId}/like`,
        method,
      });
      this.setData({
        liked: !liked,
        'craft.like_count': res.like_count,
      });
    } catch (err) {
      console.error('点赞失败:', err);
    }
  },

  onCommentTap() {
    if (checkIntercept(() => this.onCommentTap())) {
      this.setData({ showProfilePanel: true });
      return;
    }
    this.setData({ showCommentInput: true, replyTo: null });
  },

  onReplyComment(e) {
    if (checkIntercept(() => this.onReplyComment(e))) {
      this.setData({ showProfilePanel: true });
      return;
    }

    const { id, nickname } = e.currentTarget.dataset;
    this.setData({
      showCommentInput: true,
      replyTo: { id, nickname },
      commentText: '',
    });
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  async onCommentSubmit() {
    const { commentText, replyTo } = this.data;
    if (!commentText.trim()) return;

    try {
      const data = { content: commentText };
      if (replyTo) {
        data.parent_id = replyTo.id;
      }

      await request({
        url: `/mini/crafts/${this.craftId}/comments`,
        method: 'POST',
        data,
      });
      this.setData({ commentText: '', showCommentInput: false, replyTo: null });
      wx.showToast({ title: replyTo ? '回复成功' : '评论成功', icon: 'success' });
      this.loadComments();
    } catch (err) {
      console.error('评论失败:', err);
    }
  },

  onCommentCancel() {
    this.setData({ showCommentInput: false, commentText: '', replyTo: null });
  },

  onIntentTap() {
    if (checkIntercept(() => this.onIntentTap())) {
      this.setData({ showProfilePanel: true });
      return;
    }
    this.setData({ showIntentPanel: true });
  },

  onIntentClose() {
    this.setData({ showIntentPanel: false });
  },

  onPosterTap() {
    this.setData({ showPoster: true });
  },

  onPosterClose() {
    this.setData({ showPoster: false });
  },

  onProfilePanelClose() {
    this.setData({ showProfilePanel: false });
    cancelPending();
  },

  onProfileSuccess() {
    this.setData({ showProfilePanel: false });
    const app = getApp();
    app.globalData.hasProfile = true;
    executePending();
  },
});
