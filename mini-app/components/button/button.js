Component({
  properties: {
    type: {
      type: String,
      value: 'primary', // primary | secondary | text
    },
    size: {
      type: String,
      value: 'medium', // small | medium | large
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    loading: {
      type: Boolean,
      value: false,
    },
    icon: {
      type: String,
      value: '',
    },
  },

  data: {
    isPressed: false,
  },

  methods: {
    onTap() {
      if (this.data.disabled || this.data.loading) return;
      this.triggerEvent('tap');
    },

    onTouchStart() {
      if (this.data.disabled || this.data.loading) return;
      this.setData({ isPressed: true });
    },

    onTouchEnd() {
      this.setData({ isPressed: false });
    },
  },
});
