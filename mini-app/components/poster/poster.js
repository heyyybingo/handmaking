Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    craft: {
      type: Object,
      value: null,
    },
  },

  data: {
    generating: false,
    posterUrl: '',
  },

  methods: {
    async onGenerate() {
      if (this.data.generating || !this.data.craft) return;

      this.setData({ generating: true });

      try {
        const posterUrl = await this.drawPoster();
        this.setData({ posterUrl });
      } catch (err) {
        console.error('生成海报失败:', err);
        wx.showToast({ title: '生成失败', icon: 'none' });
      } finally {
        this.setData({ generating: false });
      }
    },

    async drawPoster() {
      const { craft } = this.data;
      const query = this.createSelectorQuery();
      const canvas = await new Promise((resolve) => {
        query.select('#poster-canvas')
          .fields({ node: true, size: true })
          .exec((res) => resolve(res[0].node));
      });

      const ctx = canvas.getContext('2d');
      const dpr = wx.getWindowInfo().pixelRatio;
      const width = 600;
      const height = 800;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // 背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // 加载并绘制图片
      const image = canvas.createImage();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = craft.images[0].thumbnailUrl;
      });

      // 圆角裁剪
      const imgWidth = width - 40;
      const imgHeight = 400;
      const radius = 16;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(20, 20, imgWidth, imgHeight, radius);
      ctx.clip();
      ctx.drawImage(image, 20, 20, imgWidth, imgHeight);
      ctx.restore();

      // 标题
      ctx.fillStyle = '#2D2D2D';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(craft.title, 20, 460);

      // 分类标签
      ctx.fillStyle = '#C4956A';
      ctx.font = '20px sans-serif';
      ctx.fillText(craft.category.name, 20, 500);

      // 描述
      ctx.fillStyle = '#666666';
      ctx.font = '24px sans-serif';
      const desc = craft.description || '';
      const lines = this.wrapText(ctx, desc, width - 40);
      lines.slice(0, 3).forEach((line, i) => {
        ctx.fillText(line, 20, 540 + i * 32);
      });

      // 底部信息
      ctx.fillStyle = '#999999';
      ctx.font = '18px sans-serif';
      ctx.fillText('长按识别小程序码', 20, height - 40);

      // 小程序码占位（实际需要后端生成）
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(width - 120, height - 120, 80, 80);
      ctx.fillStyle = '#999999';
      ctx.font = '12px sans-serif';
      ctx.fillText('小程序码', width - 110, height - 75);

      return new Promise((resolve) => {
        wx.canvasToTempFilePath({
          canvas,
          success: (res) => resolve(res.tempFilePath),
          fail: (err) => reject(err),
        });
      });
    },

    wrapText(ctx, text, maxWidth) {
      const lines = [];
      let currentLine = '';

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const testLine = currentLine + char;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    },

    async onSave() {
      if (!this.data.posterUrl) return;

      try {
        await wx.saveImageToPhotosAlbum({ filePath: this.data.posterUrl });
        wx.showToast({ title: '已保存到相册', icon: 'success' });
        this.triggerEvent('close');
      } catch (err) {
        if (err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '提示',
            content: '需要授权保存到相册',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            },
          });
        }
      }
    },

    onClose() {
      this.setData({ posterUrl: '' });
      this.triggerEvent('close');
    },
  },
});
