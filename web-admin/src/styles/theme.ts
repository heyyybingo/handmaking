/**
 * Ant Design 主题配置
 * 主色为暖铜色#C4956A，体现"温暖匠心"风格
 */
export const themeConfig = {
  token: {
    /** 主色：暖铜色，代表匠心打磨的温暖质感 */
    colorPrimary: '#C4956A',
    /** 辅助色：深木色 */
    colorInfo: '#8B6F4E',
    /** 成功色：青瓷绿 */
    colorSuccess: '#7BA98F',
    /** 警告色 */
    colorWarning: '#FAAD14',
    /** 错误色 */
    colorError: '#FF4D4F',
    /** 标题色 */
    colorTextHeading: '#2D2D2D',
    /** 正文色 */
    colorText: '#666666',
    /** 辅助文字色 */
    colorTextSecondary: '#999999',
    /** 背景色 */
    colorBgLayout: '#F5F5F5',
    /** 小圆角 */
    borderRadius: 8,
    /** 中圆角 */
    borderRadiusLG: 16,
    /** 大圆角 */
    borderRadiusXL: 24,
    /** 字体 */
    fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  components: {
    Layout: {
      /** 侧边栏背景色 */
      siderBg: '#FFFFFF',
      /** 头部背景色 */
      headerBg: '#FFFFFF',
    },
    Menu: {
      /** 菜单项选中背景 */
      itemSelectedBg: '#FFF7ED',
    },
  },
};

/**
 * 色彩常量
 * 供非 Ant Design 组件使用
 */
export const COLORS = {
  /** 暖铜色 - 主色 */
  primary: '#C4956A',
  /** 深木色 - 辅助色 */
  secondary: '#8B6F4E',
  /** 浅驼色 - 卡片背景 */
  lightCamel: '#E8D5C0',
  /** 青瓷绿 - 成功状态 */
  celadonGreen: '#7BA98F',
  /** 标题色 */
  heading: '#2D2D2D',
  /** 正文色 */
  text: '#666666',
  /** 辅助文字色 */
  textSecondary: '#999999',
  /** 分割线色 */
  border: '#E5E5E5',
  /** 背景色 */
  background: '#F5F5F5',
} as const;
