Component({
  properties: {
    status: {
      type: String,
      value: 'loading', // loading | noMore | error
    },
    text: {
      type: String,
      value: '',
    },
  },

  data: {
    defaultTexts: {
      loading: '加载中...',
      noMore: '已经到底了',
      error: '加载失败，点击重试',
    },
  },

  computed: {
    displayText() {
      return this.data.text || this.data.defaultTexts[this.data.status] || '';
    },
  },

  methods: {
    onTap() {
      if (this.data.status === 'error') {
        this.triggerEvent('retry');
      }
    },
  },
});
