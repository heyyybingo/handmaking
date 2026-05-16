## Why

当前管理后台的作品编辑/新建功能存在两个核心问题：

1. **行点击冲突**：表格行点击打开预览面板，导致操作列（Preview/Edit/Delete）点击时事件冲突，操作不可靠
2. **编辑体验不佳**：编辑和新建都在浮动面板中完成，空间受限，无法同时预览和编辑，不符合设计稿的全屏编辑体验

设计稿（Stitch "智能悬浮预览增强版"）明确要求编辑/新建为独立全屏页面，左侧实时预览 + 右侧表单编辑，汉堡菜单导航。

## What Changes

- 移除表格行点击行为，仅保留操作列按钮触发预览
- 新增独立路由：`/crafts/new`（新建）、`/crafts/:id/edit`（编辑）
- 重构编辑页为全屏布局：左侧手机预览 + 右侧表单
- 新增汉堡菜单：左上角 ☰ 按钮，hover 显示导航下拉菜单
- 图片上传支持拖拽排序
- 底部操作栏：取消 / 另存草稿 / 发布作品
- 编辑页不嵌套在 AdminLayout 中，独立于侧边栏

## Capabilities

### Modified Capabilities

- `content-management`：作品管理交互优化——编辑/新建从浮动面板改为独立全屏页面

## Impact

- **前端（Web Admin）**：
  - `pages/crafts/index.tsx`：移除行点击，简化浮动面板（仅预览）
  - `pages/crafts/editor.tsx`：新增独立编辑页面
  - `components/CraftEditor.tsx`：重构为左右分栏布局
  - `components/FloatingPreview.tsx`：保留，仅用于预览
  - `App.tsx`：新增路由 `/crafts/new`、`/crafts/:id/edit`
  - 无需修改 `AdminLayout.tsx`（编辑页独立于布局外）
- **依赖**：可能需要 `react-draggable` 或类似库实现图片拖拽排序
- **后端**：无变更
