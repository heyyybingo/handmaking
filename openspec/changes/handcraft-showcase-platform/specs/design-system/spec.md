## ADDED Requirements

### Requirement: 温暖匠心视觉风格定义
系统 SHALL 遵循"温暖匠心"的视觉风格，传达手作温度与匠人精神。

#### Scenario: 整体视觉基调
- **WHEN** 用户使用小程序或管理后台
- **THEN** 系统 SHALL 展现温暖、柔和、质朴的视觉基调，避免冷硬的科技感，强调手工质感与自然纹理

#### Scenario: 视觉元素规范
- **WHEN** 设计和开发UI组件
- **THEN** 所有视觉元素 SHALL 体现以下原则：圆润而非尖锐（大圆角）、柔和而非强烈（低饱和度色彩）、有机而非机械（微动效）、留白而非拥挤（充足间距）

#### Scenario: 品牌调性一致性
- **WHEN** 所有用户触达渠道展示内容
- **THEN** 小程序端、管理后台、分享卡片 SHALL 保持一致的视觉风格和品牌调性

### Requirement: 色彩系统
系统 SHALL 定义完整的色彩系统，包含主色、辅助色、中性色和语义色。

#### Scenario: 主色定义
- **WHEN** 需要使用品牌主色调
- **THEN** 系统 SHALL 使用 #C4956A（暖铜色）作为主色，应用于主要按钮、Tab高亮、关键信息强调等场景

#### Scenario: 主色梯度
- **WHEN** 需要主色的深浅变体
- **THEN** 系统 SHALL 提供主色梯度：Light #E8D5C0、Default #C4956A、Dark #9C7350、Darker #7A5838，用于悬浮态、按压态、禁用态等

#### Scenario: 辅助色定义
- **WHEN** 需要辅助色彩搭配
- **THEN** 系统 SHALL 定义以下辅助色：
  - 辅助色A（奶白）#FAF5F0：用于页面背景
  - 辅助色B（暖灰）#E8DDD3：用于卡片背景、分隔线
  - 辅助色C（木质棕）#8B6F4E：用于次要文字、图标
  - 辅助色D（织锦蓝）#6B8FB5：用于链接、辅助信息

#### Scenario: 中性色定义
- **WHEN** 需要中性灰色
- **THEN** 系统 SHALL 定义以下中性色梯度：
  - 标题文字 #2D2D2D
  - 正文文字 #4A4A4A
  - 次要文字 #8A8A8A
  - 占位文字 #B0B0B0
  - 分割线 #E5E5E5
  - 背景色 #F5F5F5

#### Scenario: 语义色定义
- **WHEN** 需要表达特定语义
- **THEN** 系统 SHALL 定义以下语义色：
  - 成功 #52C41A（绿色）
  - 警告 #FAAD14（黄色）
  - 错误 #FF4D4F（红色）
  - 信息 #1890FF（蓝色）

#### Scenario: 色彩对比度无障碍
- **WHEN** 文字与背景色搭配使用
- **THEN** 所有文字色与背景色的对比度 SHALL 满足WCAG 2.1 AA级标准（至少4.5:1）

#### Scenario: 暗色模式预留
- **WHEN** 未来需要支持暗色模式
- **THEN** 色彩系统 SHALL 预留暗色模式的色值映射方案，当前版本先实现亮色模式

### Requirement: 字体系统规范
系统 SHALL 定义完整的字体系统规范。

#### Scenario: 字体家族定义
- **WHEN** 设置文字字体
- **THEN** 系统 SHALL 使用以下字体栈：
  - 小程序端：-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", sans-serif
  - 管理后台Web端：-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif

#### Scenario: 字号阶梯定义
- **WHEN** 设置文字大小
- **THEN** 系统 SHALL 使用以下字号阶梯：
  - H1 大标题：36rpx / 24px（管理后台）
  - H2 标题：32rpx / 20px
  - H3 小标题：28rpx / 18px
  - Body 正文：26rpx / 14px
  - Caption 辅助文字：24rpx / 12px
  - Mini 极小文字：22rpx / 10px

#### Scenario: 字重规范
- **WHEN** 设置文字粗细
- **THEN** 系统 SHALL 使用以下字重：Regular 400（正文）、Medium 500（小标题）、Semibold 600（标题）、Bold 700（大标题强调）

#### Scenario: 行高规范
- **WHEN** 设置文字行高
- **THEN** 系统 SHALL 使用以下行高比：标题1.3倍、正文1.6倍、辅助文字1.5倍

### Requirement: 间距与布局系统
系统 SHALL 定义统一的间距与布局规范。

#### Scenario: 基础间距单位
- **WHEN** 设置元素间距
- **THEN** 系统 SHALL 使用4px（8rpx）为基础间距单位，所有间距 MUST 为4px的整数倍

#### Scenario: 间距阶梯定义
- **WHEN** 选择间距大小
- **THEN** 系统 SHALL 提供以下间距阶梯：
  - xs：4px（8rpx）- 极小间距，如图标与文字之间
  - sm：8px（16rpx）- 小间距，如同组元素之间
  - md：16px（32rpx）- 中间距，如卡片内边距
  - lg：24px（48rpx）- 大间距，如卡片之间
  - xl：32px（64rpx）- 超大间距，如区块之间

#### Scenario: 页面布局边距
- **WHEN** 设置页面内容区域边距
- **THEN** 小程序端 SHALL 使用24rpx左右边距，管理后台内容区 SHALL 使用24px左右边距

#### Scenario: 圆角规范
- **WHEN** 设置元素圆角
- **THEN** 系统 SHALL 提供以下圆角阶梯：
  - 小圆角：4px（8rpx）- 标签、小按钮
  - 中圆角：8px（16rpx）- 输入框、小卡片
  - 大圆角：12px（24rpx）- 大卡片、弹窗
  - 全圆角：50% - 头像、圆形图标

#### Scenario: 阴影规范
- **WHEN** 设置卡片阴影
- **THEN** 系统 SHALL 提供以下阴影层级：
  - 低层级：box-shadow: 0 1px 4px rgba(0,0,0,0.08) - 微弱阴影
  - 中层级：box-shadow: 0 2px 8px rgba(0,0,0,0.12) - 卡片常规阴影
  - 高层级：box-shadow: 0 4px 16px rgba(0,0,0,0.16) - 弹窗、浮层阴影

### Requirement: 按钮组件风格规范
系统 SHALL 定义按钮组件的风格规范。

#### Scenario: 主按钮样式
- **WHEN** 渲染主要操作按钮（如"发布作品"、"提交"）
- **THEN** 按钮 SHALL 使用主色 #C4956A 作为背景色，白色文字，中圆角（16rpx），高度80rpx，按下态使用主色Dark变体

#### Scenario: 次要按钮样式
- **WHEN** 渲染次要操作按钮（如"取消"、"返回"）
- **THEN** 按钮 SHALL 使用白色背景，主色边框，主色文字，中圆角（16rpx），高度80rpx

#### Scenario: 文字按钮样式
- **WHEN** 渲染文字按钮（如"查看更多"、"了解更多"）
- **THEN** 按钮 SHALL 无背景无边框，主色文字，文字后带右箭头图标

#### Scenario: 按钮禁用态
- **WHEN** 按钮处于禁用状态
- **THEN** 按钮 SHALL 使用 #E5E5E5 背景，#B0B0B0 文字，不可点击

#### Scenario: 按钮加载态
- **WHEN** 按钮操作正在执行中
- **THEN** 按钮 SHALL 展示旋转加载图标，文字变为"处理中..."，不可重复点击

#### Scenario: 按钮尺寸规范
- **WHEN** 选择按钮尺寸
- **THEN** 系统 SHALL 提供以下尺寸：
  - 大按钮：高度80rpx，字号28rpx，用于页面主操作
  - 中按钮：高度64rpx，字号26rpx，用于弹窗操作
  - 小按钮：高度48rpx，字号24rpx，用于标签操作

### Requirement: 卡片组件风格规范
系统 SHALL 定义卡片组件的风格规范。

#### Scenario: 作品卡片样式
- **WHEN** 渲染作品展示卡片
- **THEN** 卡片 SHALL 使用白色背景，大圆角（24rpx），中层级阴影，卡片内容与边缘间距24rpx

#### Scenario: 卡片悬浮态
- **WHEN** 管理后台Web端用户悬浮在卡片上
- **THEN** 卡片 SHALL 提升至高层级阴影，微微上移2px，过渡动画200ms

#### Scenario: 卡片点击态
- **WHEN** 小程序端用户按压卡片
- **THEN** 卡片 SHALL 整体透明度降低至0.85，松开后恢复

#### Scenario: 统计卡片样式
- **WHEN** 渲染数据统计卡片
- **THEN** 卡片 SHALL 使用白色背景，中圆角（16rpx），低层级阴影，卡片内展示数值、标签和趋势图标

### Requirement: 导航组件风格规范
系统 SHALL 定义导航组件的风格规范。

#### Scenario: 底部TabBar样式
- **WHEN** 渲染小程序底部导航栏
- **THEN** TabBar SHALL 包含3个Tab项（首页/分类/我的），使用白色背景，顶部1px分割线，Tab图标使用线框风格，选中态使用主色填充

#### Scenario: 顶部导航栏样式
- **WHEN** 渲染小程序页面顶部导航栏
- **THEN** 导航栏 SHALL 使用辅助色A（#FAF5F0）背景，标题居中，返回按钮左侧，使用系统胶囊样式

#### Scenario: 管理后台侧边导航样式
- **WHEN** 渲染管理后台侧边导航
- **THEN** 导航 SHALL 使用深色背景（#2D2D2D），白色文字，选中项使用主色背景高亮

### Requirement: 弹窗组件风格规范
系统 SHALL 定义弹窗组件的风格规范。

#### Scenario: 确认弹窗样式
- **WHEN** 渲染确认操作弹窗
- **THEN** 弹窗 SHALL 居中展示，大圆角（24rpx），白色背景，标题居中，底部双按钮（取消/确认），确认按钮使用主色

#### Scenario: 底部弹出面板样式
- **WHEN** 渲染底部弹出面板（如分类选择、评论输入）
- **THEN** 面板 SHALL 从底部滑入，顶部大圆角（24rpx），白色背景，最大高度屏幕70%，支持下滑关闭

#### Scenario: Toast提示样式
- **WHEN** 渲染轻提示Toast
- **THEN** Toast SHALL 居中展示，圆角背景，半透明黑色背景+白色文字或主色背景+白色文字，2秒后自动消失

#### Scenario: 加载弹窗样式
- **WHEN** 渲染加载中弹窗
- **THEN** 弹窗 SHALL 居中展示旋转加载图标+提示文字，半透明遮罩，禁止点击穿透

### Requirement: 动效规范
系统 SHALL 定义统一的动效规范，确保交互流畅自然。

#### Scenario: 过渡动画时长
- **WHEN** 元素状态变化需要过渡动画
- **THEN** 系统 SHALL 使用以下时长规范：
  - 即时反馈：100ms - 按钮按压、开关切换
  - 短过渡：200ms - 颜色变化、阴影变化
  - 中过渡：300ms - 弹窗弹出、页面切换
  - 长过渡：500ms - 复杂动画、页面入场

#### Scenario: 缓动函数
- **WHEN** 元素执行过渡动画
- **THEN** 系统 SHALL 使用以下缓动函数：
  - 常规：ease-out - 大部分UI过渡
  - 弹性：cubic-bezier(0.34, 1.56, 0.64, 1) - 弹窗弹出、元素入场
  - 平滑：ease-in-out - 页面切换

#### Scenario: 列表项入场动画
- **WHEN** 列表数据加载完成
- **THEN** 列表项 SHALL 依次从下方淡入上移入场，每项延迟50ms，营造流畅的视觉节奏

#### Scenario: 下拉刷新动画
- **WHEN** 用户下拉触发刷新
- **THEN** 系统 SHALL 展示自定义加载动画（旋转的匠心图标），与品牌调性一致

#### Scenario: 点赞动画
- **WHEN** 用户点击点赞按钮
- **THEN** 系统 SHALL 播放心形填充动画+小粒子扩散效果，持续时间300ms

#### Scenario: 骨架屏加载
- **WHEN** 页面数据加载中
- **THEN** 系统 SHALL 展示骨架屏而非空白页面，骨架屏使用灰色块模拟内容布局，带有闪烁动画

#### Scenario: 减少动效适配
- **WHEN** 用户系统设置开启"减少动效"
- **THEN** 系统 SHALL 关闭装饰性动画，仅保留必要的状态过渡，过渡时长统一缩短为100ms

### Requirement: 微信分享卡片设计规范
系统 SHALL 定义微信分享卡片的视觉设计规范。

#### Scenario: 分享到好友卡片设计
- **WHEN** 生成分享给好友的卡片
- **THEN** 卡片 SHALL 使用5:4的宽高比，卡片内容包含：作品封面图（占卡片上方60%区域）、作品标题（下方左侧，主色文字，最多两行）、作者昵称（下方右侧，灰色辅助文字）

#### Scenario: 分享海报设计
- **WHEN** 生成分享到朋友圈的海报
- **THEN** 海报 SHALL 使用3:4的宽高比，包含以下区域：
  - 顶部：作品主图（占60%区域）
  - 中部：作品标题（大字号，主色）
  - 中下部：作品描述摘要（小字号，灰色，最多3行）
  - 底部：作者头像+昵称（左侧）+ 小程序码（右侧）
  - 背景：辅助色A（#FAF5F0）

#### Scenario: 海报品牌元素
- **WHEN** 海报生成
- **THEN** 海报底部 SHALL 包含品牌名称和小程序码，小程序码尺寸不小于120rpx

#### Scenario: 海报文字可读性
- **WHEN** 海报中包含文字
- **THEN** 所有文字 SHALL 在图片背景上清晰可读，必要时使用半透明遮罩层确保对比度

### Requirement: 适配策略
系统 SHALL 定义多端多尺寸的适配策略。

#### Scenario: 小程序屏幕宽度适配
- **WHEN** 小程序在不同宽度的设备上运行
- **THEN** 系统 SHALL 使用rpx作为尺寸单位，基于750rpx设计稿等比缩放，确保各设备上的视觉比例一致

#### Scenario: 瀑布流高度适配
- **WHEN** 瀑布流展示作品卡片
- **THEN** 系统 SHALL 根据图片宽高比动态计算卡片高度，使用CSS column布局或JS计算定位，保持图片不裁切

#### Scenario: 管理后台响应式布局
- **WHEN** 管理后台在不同屏幕宽度下访问
- **THEN** 系统 SHALL 实现以下断点适配：
  - >=1200px：完整布局（侧边导航展开+内容区宽屏）
  - 768px-1199px：紧凑布局（侧边导航折叠+内容区适中）
  - <768px：移动布局（顶部导航+内容区全屏），提示"建议使用PC端获得最佳体验"

#### Scenario: 刘海屏安全区域适配
- **WHEN** 小程序在刘海屏设备上运行
- **THEN** 系统 SHALL 使用wx.getSystemInfoSync()获取安全区域，顶部导航和底部TabBar避开刘海和底部安全区

#### Scenario: 横屏适配
- **WHEN** 用户在横屏模式下使用小程序
- **THEN** 系统 SHALL 锁定竖屏方向，避免横屏导致的布局错乱

#### Scenario: 字体缩放适配
- **WHEN** 用户系统设置了较大的字体缩放比例
- **THEN** 系统 SHALL 限制最大字体缩放比例为1.5倍，避免布局溢出

#### Scenario: 网络弱网适配
- **WHEN** 用户在弱网环境下使用小程序
- **THEN** 系统 SHALL 对图片启用懒加载和渐进式加载，展示低质量占位图后逐步清晰化，超时5秒展示加载失败占位图

### Requirement: 图标与插画规范
系统 SHALL 定义图标和插画的风格规范。

#### Scenario: 图标风格
- **WHEN** 使用功能图标
- **THEN** 图标 SHALL 使用线性风格（Line Icon），线宽2px，圆角端点，统一使用主色或中性色，尺寸统一为24px/48rpx

#### Scenario: 空状态插画风格
- **WHEN** 展示空状态页面
- **THEN** 插画 SHALL 使用暖色系手绘风格，与品牌调性一致，配合引导性文案

#### Scenario: TabBar图标规范
- **WHEN** 渲染底部TabBar图标
- **THEN** 图标尺寸 SHALL 为48rpx，未选中态使用线框风格（#8A8A8A），选中态使用填充风格（#C4956A）

### Requirement: 组件交互状态规范
系统 SHALL 定义组件的交互状态规范。

#### Scenario: 可点击元素按压反馈
- **WHEN** 用户按压可点击元素
- **THEN** 元素 SHALL 提供视觉反馈（透明度变化0.85、颜色变深或缩放0.98），松开后恢复

#### Scenario: 输入框焦点态
- **WHEN** 输入框获取焦点
- **THEN** 输入框边框 SHALL 变为主色，展示柔和的主色外发光效果

#### Scenario: 输入框错误态
- **WHEN** 输入内容校验失败
- **THEN** 输入框边框 SHALL 变为错误语义色，下方展示红色错误提示文字

#### Scenario: 长列表滚动性能
- **WHEN** 列表数据量较大（超过100项）
- **THEN** 系统 SHALL 使用虚拟列表技术或回收机制，确保滚动帧率不低于30fps
