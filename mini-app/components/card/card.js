Component({
  properties: {
    padding: {
      type: Boolean,
      value: true,
    },
    hover: {
      type: Boolean,
      value: false,
    },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap');
    },
  },
});
