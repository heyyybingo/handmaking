Component({
  properties: {
    title: {
      type: String,
      value: '',
    },
    back: {
      type: Boolean,
      value: false,
    },
    bgColor: {
      type: String,
      value: '#C4956A',
    },
    textColor: {
      type: String,
      value: '#FFFFFF',
    },
  },

  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
  },

  lifetimes: {
    attached() {
      const sysInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sysInfo.statusBarHeight || 20,
      });
    },
  },

  methods: {
    onBack() {
      wx.navigateBack({ delta: 1 });
    },
  },
});
