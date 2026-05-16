# Tasks

## 1. 列表页改造

- [x] 1.1 移除 CraftsPage 表格行点击行为（移除 onRow 和标题列 onCell）
- [x] 1.2 修改 Edit 按钮：点击后跳转路由 `/crafts/${id}/edit`
- [x] 1.3 修改新建按钮：点击后跳转路由 `/crafts/new`
- [x] 1.4 移除编辑相关状态（editingCraft、isCreating、submitting），仅保留预览状态

## 2. 路由配置

- [x] 2.1 在 App.tsx 新增路由 `/crafts/new` → CraftEditorPage
- [x] 2.2 在 App.tsx 新增路由 `/crafts/:id/edit` → CraftEditorPage
- [x] 2.3 确保编辑/新建路由在 AdminLayout 之外（独立全屏）

## 3. 汉堡菜单组件

- [x] 3.1 创建 HamburgerMenu 组件（hover 显示导航下拉菜单）
- [x] 3.2 菜单内容复用 AdminLayout 的 menuItems
- [x] 3.3 菜单点击导航到对应页面

## 4. 编辑页主组件

- [x] 4.1 创建 CraftEditorPage 页面组件（`pages/crafts/editor.tsx`）
- [x] 4.2 实现路由参数解析（获取 craft id，判断新建/编辑模式）
- [x] 4.3 实现数据加载（编辑模式下获取 craft 数据）
- [x] 4.4 实现保存逻辑（另存草稿 / 发布作品）

## 5. 编辑页布局重构

- [x] 5.1 重构 CraftEditor 组件为左右分栏布局（预览区 + 表单区）
- [x] 5.2 实现左侧手机预览区（375px 宽度，实时预览）
- [x] 5.3 实现右侧表单编辑区
- [x] 5.4 实现底部操作栏（取消 / 另存草稿 / 发布作品）

## 6. 图片拖拽排序

- [x] 6.1 安装 react-draggable 或 @dnd-kit 依赖
- [x] 6.2 实现图片列表拖拽排序功能
- [x] 6.3 实现拖拽手柄和拖拽动画

## 7. 表单字段完善

- [x] 7.1 作品图片上传区域（支持多图、拖拽排序）
- [x] 7.2 作品名称输入框（预留 AI 建议按钮位置）
- [x] 7.3 详细介绍富文本编辑器（wangeditor）
- [x] 7.4 分类下拉选择器
- [x] 7.5 标签输入（支持自定义标签）
- [x] 7.6 公开可见开关

## 8. 样式与交互

- [x] 8.1 编辑页背景色 `#F5F5F5`
- [x] 8.2 汉堡菜单样式（图标、下拉菜单、hover 效果）
- [x] 8.3 手机预览区样式（外框、圆角、阴影）
- [x] 8.4 底部操作栏样式（固定底部、按钮样式）
- [x] 8.5 表单输入框聚焦色 `#C4956A`

## 9. 清理与验证

- [x] 9.1 移除 CraftsPage 中不再使用的浮动面板编辑功能
- [x] 9.2 确保 FloatingPreview 仅用于预览
- [x] 9.3 验证路由跳转正确性
- [x] 9.4 验证表单保存功能正常
