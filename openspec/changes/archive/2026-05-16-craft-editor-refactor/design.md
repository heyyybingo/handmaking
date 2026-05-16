# Craft Editor Refactor - 设计文档

## 概述

将管理后台的作品编辑/新建功能从浮动面板重构为独立全屏页面，提升编辑体验。

## 架构变更

### 路由结构

```
当前:
/crafts              → CraftsPage (列表 + 浮动面板编辑/预览)

目标:
/crafts              → CraftsPage (列表 + 浮动面板仅预览)
/crafts/new          → CraftEditorPage (独立全屏编辑页)
/crafts/:id/edit     → CraftEditorPage (独立全屏编辑页)
```

### 页面层级关系

```
┌─────────────────────────────────────────────────────────────┐
│  App.tsx 路由结构                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  <Routes>                                                   │
│    /login → LoginPage                                       │
│    / → AdminLayout                                          │
│      /dashboard → DashboardPage                             │
│      /crafts → CraftsPage ← 列表页（在 AdminLayout 内）     │
│      /categories → CategoriesPage                           │
│      ...                                                    │
│    /crafts/new → CraftEditorPage ← 新建页（独立全屏）        │
│    /crafts/:id/edit → CraftEditorPage ← 编辑页（独立全屏）   │
│  </Routes>                                                  │
│                                                             │
│  关键：编辑/新建路由在 AdminLayout 之外，不显示侧边栏        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 页面设计

### 1. 作品列表页（CraftsPage）修改

**移除：**
- Table 的 `onRow` 点击事件
- 标题列的 `onCell` 点击事件

**保留：**
- 操作列按钮：Preview（打开浮动预览）、Edit（跳转编辑页）、Delete
- 浮动预览面板（仅用于预览，不用于编辑）

**修改：**
- Edit 按钮点击后：`navigate(/crafts/${record.id}/edit)`
- 新建按钮点击后：`navigate(/crafts/new)`

### 2. 编辑/新建页（CraftEditorPage）设计

#### 整体布局

```
┌──────────────────────────────────────────────────────────────┐
│  ☰ 汉堡菜单（hover 显示下拉导航）        温暖匠心            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┬──────────────────────────────┐     │
│  │                     │                              │     │
│  │   📱 实时预览        │   📝 编辑手工作品             │     │
│  │                     │                              │     │
│  │   ┌───────────────┐ │   作品图片 *                 │     │
│  │   │               │ │   ┌─────┬─────┬─────┐       │     │
│  │   │   Craft Card  │ │   │ 📷  │ 📷  │ 📷+ │       │     │
│  │   │               │ │   └─────┴─────┴─────┘       │     │
│  │   │   [Image]     │ │   (可拖拽排序)               │     │
│  │   │   Title       │ │                              │     │
│  │   │   Author      │ │   作品名称 *                 │     │
│  │   │   Description │ │   ┌────────────────────┐    │     │
│  │   │               │ │   │                    │    │     │
│  │   └───────────────┘ │   └────────────────────┘    │     │
│  │                     │                              │     │
│  │                     │   详细介绍                    │     │
│  │                     │   ┌────────────────────┐    │     │
│  │                     │   │ B I U ... 工具栏   │    │     │
│  │                     │   │                    │    │     │
│  │                     │   │ 富文本编辑器        │    │     │
│  │                     │   │                    │    │     │
│  │                     │   └────────────────────┘    │     │
│  │                     │                              │     │
│  │                     │   分类 *    标签              │     │
│  │                     │   [▼ 选择]  [手工皮具]       │     │
│  │                     │                              │     │
│  │                     │   公开可见                    │     │
│  │                     │   关闭后作品仅自己可见... [○] │     │
│  │                     │                              │     │
│  └─────────────────────┴──────────────────────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    取消      另存草稿      发布作品    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 汉堡菜单

- 位置：左上角，固定定位
- 默认状态：仅显示 ☰ 图标
- 交互：hover 时显示下拉菜单
- 菜单内容：复用 `AdminLayout` 中的 `menuItems`（数据概览、作品管理、分类管理、评论管理、意向管理、系统配置）
- 点击菜单项：`navigate(key)` 跳转到对应页面

```
┌─────────────────────────────────────┐
│  ☰  ─── hover ───▶  ┌────────────┐ │
│                      │ 数据概览    │ │
│                      │ 作品管理    │ │
│                      │ 分类管理    │ │
│                      │ 评论管理    │ │
│                      │ 意向管理    │ │
│                      │ 系统配置    │ │
│                      └────────────┘ │
└─────────────────────────────────────┘
```

#### 左侧：手机预览区

- 模拟手机屏幕尺寸（375px 宽度）
- 实时展示当前编辑的作品卡片
- 预览内容随表单变化实时更新（受控模式）
- 包含：图片轮播、标题、作者信息、描述、分类标签

#### 右侧：表单编辑区

表单字段布局（从上到下）：

1. **作品图片** *
   - 图片上传区域
   - 支持多图上传
   - **拖拽排序**：已上传图片可拖拽调整顺序
   - 拖拽手柄：每张图片左上角显示拖拽图标
   - 拖拽库：使用 `react-draggable` 或 `dnd-kit`

2. **作品名称** *
   - 文本输入框
   - 右侧可选 "AI 建议标题" 按钮（预留）

3. **详细介绍**
   - 富文本编辑器（wangeditor）
   - 工具栏：加粗、斜体、下划线、标题、列表、链接、图片
   - 编辑器高度：300px

4. **分类** *
   - 下拉选择器
   - 选项来自 API

5. **标签**
   - 标签输入模式（支持自定义标签）

6. **公开可见**
   - 开关组件
   - 说明文字："关闭后作品仅自己可见，适合作为草稿暂存"

#### 底部操作栏

- 固定在页面底部
- 三个按钮：
  - **取消**：返回列表页
  - **另存草稿**：保存为草稿状态
  - **发布作品**：保存并发布

## 组件设计

### 新增组件

#### CraftEditorPage (`pages/crafts/editor.tsx`)

独立全屏页面组件，不嵌套在 AdminLayout 中。

```
Props:
  - 无（从路由参数获取 craft id）

功能:
  - 从 URL 参数获取 craft id（新建时无 id）
  - 调用 API 获取 craft 数据（编辑时）
  - 管理表单状态
  - 处理保存/发布逻辑
  - 渲染汉堡菜单、预览区、表单区、操作栏
```

#### HamburgerMenu (`components/HamburgerMenu.tsx`)

汉堡菜单组件。

```
Props:
  - items: MenuProps['items']（菜单项）

功能:
  - 默认隐藏菜单
  - hover 显示下拉菜单
  - 点击菜单项触发导航
```

### 修改组件

#### CraftsPage (`pages/crafts/index.tsx`)

```
修改:
  - 移除 onRow 点击事件
  - 移除标题列 onCell 点击事件
  - Edit 按钮: navigate(/crafts/${id}/edit)
  - 新建按钮: navigate(/crafts/new)
  - FloatingPreview 仅用于预览
  - 移除 isCreating 和 editingCraft 状态
```

#### CraftEditor (`components/CraftEditor.tsx`)

```
重构:
  - 布局从垂直表单改为左右分栏
  - 新增图片拖拽排序功能
  - 新增实时预览联动
  - 底部操作栏：取消 / 另存草稿 / 发布作品
  - 新增 visibility 字段（公开可见）
```

### 保留组件

#### FloatingPreview (`components/FloatingPreview.tsx`)

保留不变，仅用于列表页的预览功能。

#### CraftPreview (`components/CraftPreview.tsx`)

保留不变，用于预览面板和编辑页左侧预览区。

## 状态管理

### CraftsPage 状态

```typescript
// 简化后的状态
const [selectedCraft, setSelectedCraft] = useState<Craft | null>(null);  // 预览用
const [statusFilter, setStatusFilter] = useState<string | undefined>();
const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

// 移除的状态
// - editingCraft (移至 CraftEditorPage)
// - isCreating (移至 CraftEditorPage)
// - submitting (移至 CraftEditorPage)
```

### CraftEditorPage 状态

```typescript
const [form] = Form.useForm();
const [editor, setEditor] = useState<IDomEditor | null>(null);
const [fileList, setFileList] = useState<UploadFile[]>([]);
const [saving, setSaving] = useState(false);
const [publishing, setPublishing] = useState(false);

// 从 URL 参数获取
const { id } = useParams<{ id: string }>();
const isEditing = !!id;
```

## 数据流

```
┌─────────────────────────────────────────────────────────────┐
│  编辑页数据流                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  URL (/crafts/:id/edit)                                    │
│       │                                                     │
│       ▼                                                     │
│  CraftEditorPage                                            │
│       │                                                     │
│       ├──▶ GET /api/admin/crafts/:id (加载数据)             │
│       │                                                     │
│       ▼                                                     │
│  Form State (受控)                                          │
│       │                                                     │
│       ├──▶ CraftPreview (左侧实时预览)                      │
│       │                                                     │
│       └──▶ 表单输入 (右侧编辑)                              │
│                                                             │
│  保存:                                                      │
│       ├──▶ 另存草稿: PUT /api/admin/crafts/:id (status=draft)│
│       └──▶ 发布: PUT /api/admin/crafts/:id (status=published)│
│                                                             │
│  新建:                                                      │
│       └──▶ POST /api/admin/crafts (status=draft/published)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 图片拖拽排序

### 实现方案

使用 `react-draggable` 或 `@dnd-kit/core` 实现图片列表拖拽排序。

### 交互设计

```
┌─────────────────────────────────────────────────────────────┐
│  图片拖拽排序                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┬─────────┬─────────┐                          │
│  │ ⋮⋮ 📷   │ ⋮⋮ 📷   │    📷+  │                          │
│  │ Image 1 │ Image 2 │  Upload │                          │
│  └─────────┴─────────┴─────────┘                          │
│                                                             │
│  - ⋮⋮ 拖拽手柄：鼠标悬停显示                                │
│  - 拖拽时：半透明预览 + 占位符                              │
│  - 释放时：动画过渡到新位置                                  │
│  - 排序结果：更新 fileList 的顺序                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 数据结构

```typescript
interface UploadFile {
  uid: string;
  name: string;
  status: 'done' | 'uploading' | 'error';
  url: string;
  thumbUrl: string;
  sort: number;  // 新增：排序索引
}
```

## 样式规范

### 页面背景

- 编辑页背景：`#F5F5F5`（与 AdminLayout Content 区域一致）

### 汉堡菜单

- 图标颜色：`#2D2D2D`
- 菜单背景：`#FFFFFF`
- 菜单阴影：`0 4px 12px rgba(0,0,0,0.1)`
- 菜单项 hover：`#F5F5F5`

### 手机预览区

- 手机外框：圆角 24px，阴影
- 屏幕区域：白色背景
- 宽度：375px（固定）

### 表单区

- 表单标签：`#2D2D2D`，14px
- 输入框边框：`#E5E5E5`
- 输入框聚焦：`#C4956A`（primary color）

### 底部操作栏

- 背景：`#FFFFFF`
- 顶部边框：`1px solid #E5E5E5`
- 按钮间距：12px
- 取消按钮：default 样式
- 另存草稿：default 样式
- 发布作品：primary 样式

## 风险与注意事项

1. **路由守卫**：编辑/新建页需要认证保护，但不嵌套在 AdminLayout 中，需单独处理
2. **图片拖拽库选择**：`react-draggable` 轻量但功能简单，`@dnd-kit` 功能丰富但体积大
3. **实时预览性能**：频繁更新可能导致预览区闪烁，需要防抖处理
4. **表单未保存提示**：离开页面时如果有未保存修改，需要提示用户
5. **移动端适配**：编辑页主要面向桌面端，但需确保基本的响应式
