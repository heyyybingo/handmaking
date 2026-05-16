Component({
  properties: {
    src: {
      type: String,
      value: '',
    },
    size: {
      type: Number,
      value: 80,
    },
    defaultIcon: {
      type: String,
      value: '👤',
    },
  },

  data: {
    hasError: false,
  },

  observers: {
    src() {
      this.setData({ hasError: false });
    },
  },

  methods: {
    onError() {
      this.setData({ hasError: true });
    },
  },
});
