## Context

本项目为全新手作展示平台，零起步，包含三个部分：微信小程序端（原生开发）、Web管理后台（React + Ant Design Pro）、服务端（NestJS）。平台核心用户为手作爱好者，需要展示、分享、管理手工制品。一期聚焦展示与互动，不含交易支付。

**当前状态**：全新项目，无遗留代码和系统约束。

**利益相关者**：手作作者（唯一管理员）、访客用户（微信生态内浏览互动）。

## Goals / Non-Goals

**Goals:**

- 小程序端实现"温暖匠心"视觉风格，界面吸引人，交互极简，3步内完成核心操作
- Web管理后台高效操作，支持批量管理，降低内容管理成本
- 服务端架构清晰可扩展，为后续订单交易等功能预留接口
- 社交互动流畅自然，促进微信生态内分享传播

**Non-Goals:**

- 一期不实现AI辅助功能（AI生成描述/标签/图片建议、AI配置面板）——延后至二期，编辑页预留禁用态按钮
- 一期不实现真实交易、支付、物流功能
- 不实现多作者/多店铺体系（一期仅单一管理员）
- 不实现复杂的推荐算法（仅按时间/分类排序）
- 不实现独立的H5展示站
- 不实现深色模式（一期仅浅色主题）
- 不实现多语言支持

## Decisions

### 1. 整体架构决策

**决策**：采用三端分离架构（小程序 + Web管理 + API Server）

**理由**：
- 小程序与Web管理后台面向完全不同的用户群体和场景，独立开发更灵活
- NestJS作为统一API服务，两端共用，减少重复逻辑
- 前后端分离，各端可独立部署和迭代

**替代方案**：
- ~Next.js全栈方案~：不适合小程序原生开发需求
- ~Koa + 手动路由~：NestJS提供更完善的模块化、装饰器、依赖注入体系

### 2. 服务端框架选型

**决策**：NestJS + TypeORM

**理由**：
- NestJS模块化架构天然适配多能力模块划分（craft-showcase, social-interaction等）
- 装饰器语法简化API路由、参数校验、权限控制
- 内置WebSocket支持，为后续实时通知预留
- TypeORM支持MySQL/PostgreSQL，迁移工具成熟

**替代方案**：
- ~Koa2~：更轻量但缺乏模块化体系，需要手动搭建大量基础设施
- ~Express~：生态最大但回调风格和缺乏TypeScript原生支持

### 3. 数据库选型

**决策**：PostgreSQL + Redis

**理由**：
- PostgreSQL支持JSON字段（存储AI生成配置、动态表单等）、全文搜索（tsvector）
- Redis用于：会话管理、点赞计数缓存、接口限流、热数据缓存

**替代方案**：
- ~MySQL~：成熟稳定但JSON支持和全文搜索弱于PostgreSQL
- ~MongoDB~：灵活但不适合关系型数据为主的内容管理场景

### 4. 小程序端技术决策

**决策**：微信原生开发

**理由**：
- 原生性能最优，瀑布流、视频播放、图片预览等体验最佳
- 微信分享能力（onShareAppMessage/onShareTimeline）原生支持最完善
- 避免跨平台框架带来的包大小膨胀和兼容性问题

**替代方案**：
- ~Taro/uni-app~：跨平台优势但本项目仅需微信端，且复杂交互原生更优

#### 瀑布流布局实现

**决策**：自定义双列瀑布流组件

**理由**：
- CSS Columns在微信小程序中表现不稳定
- 自定义组件可精确控制列分配算法（按高度最短列分配）
- 支持图片预计算高度，避免布局跳动

#### 图片加载策略

**决策**：CDN缩略图 + 懒加载 + 渐进式加载

**方案**：
- 上传时生成3种尺寸缩略图：200x200（列表缩略图）、400x400（瀑布流）、原图（详情页）
- 列表页仅加载400x400缩略图，详情页按需加载原图
- 使用微信小程序`<image lazy-load>`属性实现懒加载
- 渐进式加载：先显示低质量占位，再替换高清图

#### 视频播放方案

**决策**：原生`<video>`组件 + 自动封面图

**方案**：
- 使用微信原生video组件，支持自动播放控制
- 上传视频时自动提取首帧作为封面图
- 列表页仅显示封面图，点击后进入详情页播放

### 5. 微信小程序登录流程决策

**决策**：极简登录模式——静默登录获取身份，按需补充用户信息

**核心理念**：用户打开小程序即自动完成静默登录（获取openid），无需任何手动操作即可浏览内容。仅在需要互动（点赞/评论/我想要）时引导完善头像昵称。

**理由**：
- 符合"交互极简，3步内完成核心操作"的设计目标
- 用户打开即看到精美瀑布流，不被登录打断，降低流失率
- 微信生态中浏览内容是天然行为，互动才需要身份标识
- "完善信息"半屏面板与"我想要"面板交互风格一致

**替代方案**：
- ~登录页引导（思路B）~：首次弹出登录页收集头像昵称，体验尚可但打断浏览流程
- ~强制登录（思路C）~：必须登录才能进入，违背极简原则，用户直接流失

#### 5.1 微信登录API适配（2022年后）

**重要背景**：微信已废弃`wx.getUserProfile`接口，不再支持弹窗获取用户头像和昵称。当前获取方式：
- **openid**：`wx.login` + 后端`code2Session`，仍然有效
- **头像**：`<button open-type="chooseAvatar">`，用户主动选择
- **昵称**：`<input type="nickname">`，用户主动输入

#### 5.2 完整登录流程

```
阶段1：静默登录（自动，用户无感知）
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│打开小程序  │────▶│ wx.login     │────▶│ 后端code2Ses │
│           │     │ 获取code     │     │ sion换openid │
└──────────┘     └──────────────┘     └──────┬───────┘
                                              │
                              ┌────────────────┼────────────┐
                              ▼                             ▼
                       openid已存在                  openid不存在
                       查到用户记录                  创建新用户
                       返回Token                    角色=visitor
                                                     返回Token

阶段2：浏览内容（无需任何操作）
  → 首页瀑布流直接展示
  → 作品详情页直接可看
  → 搜索、分类浏览均可用

阶段3：首次互动时引导完善信息（半屏面板）
┌─────────────────────────────────────┐
│  完善个人信息，让大家认识你~          │
│                                     │
│  [选择头像] ← button open-type      │
│              ="chooseAvatar"        │
│  [输入昵称] ← input type           │
│              ="nickname"            │
│                                     │
│  [确认]        [跳过]               │
└─────────────────────────────────────┘
  → 确认：保存头像昵称，完成互动操作
  → 跳过：使用默认信息完成互动，后续可在"我的"中补充

触发时机：
  - 首次点赞
  - 首次评论
  - 首次"我想要"
  - 进入"我的"页面（仅提示，不强制）
```

#### 5.3 Token策略

- **accessToken**：有效期7天，用于API请求认证
- **refreshToken**：有效期30天，用于accessToken续期
- Token中包含：userId、openid、role、是否已完善信息（hasProfile）
- 静默登录：每次打开小程序自动wx.login换取新Token
- 续期策略：accessToken过期前1天自动续期，用户无感知

#### 5.4 管理员身份关联

管理员（作者）使用同一个微信账号登录小程序，后端根据openid识别管理员身份：
- 管理员的openid在数据库User表中role=admin
- 小程序端根据Token中role=admin展示"发布作品"等管理入口
- Web管理后台使用独立的账号密码登录体系（与小程序登录无关）

#### 5.5 "我的"页面展示

```
已完善信息的用户：              未完善信息的用户：
┌──────────────────┐          ┌──────────────────┐
│  [用户头像]       │          │  [默认头像]       │
│  用户昵称         │          │  手作爱好者       │
│  用户简介         │          │  点击完善个人信息>│ ← 引导入口
│                   │          │                   │
│  我的作品(5)      │          │  我的作品(0)      │
│  我的点赞(12)     │          │  我的点赞(3)      │
│  我的评论(3)      │          │  我的评论(1)      │
└──────────────────┘          └──────────────────┘
```

### 7. 视觉风格决策

**决策**："温暖匠心"风格体系

**色彩体系**：
- **主色**：`#C4956A`（暖铜色）—— 代表匠心打磨的温暖质感，用于主按钮、TabBar高亮、关键信息
- **辅助色**：`#8B6F4E`（深木色）—— 用于次级操作、图标、文字强调
- **辅助色2**：`#E8D5C0`（浅驼色）—— 用于卡片背景、分隔区域
- **辅助色3**：`#7BA98F`（青瓷绿）—— 用于成功状态、自然元素点缀
- **中性色**：`#2D2D2D`（标题）、`#666666`（正文）、`#999999`（辅助文字）、`#E5E5E5`（分割线）、`#F5F5F5`（背景）
- **语义色**：`#52C41A`（成功）、`#FAAD14`（警告）、`#FF4D4F`（错误）

**字体系统**：
- 小程序端：系统默认字体（iOS: PingFang SC / Android: Source Han Sans）
- Web端：`"Inter", "PingFang SC", "Microsoft YaHei", sans-serif`
- 字号层级：H1 36rpx、H2 32rpx、H3 28rpx、正文 28rpx、辅助 24rpx、标签 20rpx
- 字重：常规400、中500、粗600

**圆角系统**：
- 小圆角：8rpx（按钮、标签）
- 中圆角：16rpx（卡片、输入框）
- 大圆角：24rpx（弹窗、大卡片）
- 全圆角：50%（头像）

**间距系统**：
- 基准单位：8rpx
- 常用值：8/16/24/32/48rpx
- 卡片内边距：24rpx
- 页面边距：32rpx

**阴影系统**：
- 一级阴影（卡片）：`0 2rpx 12rpx rgba(0,0,0,0.08)`
- 二级阴影（弹窗）：`0 8rpx 24rpx rgba(0,0,0,0.12)`
- 三级阴影（浮层）：`0 16rpx 48rpx rgba(0,0,0,0.16)`

### 8. 关键交互设计决策

#### 首页/发现页

**决策**：瀑布流双列布局 + 顶部分类横向滚动

- 顶部：分类横向滚动Tab（全部/编织/陶艺/木工/刺绣/皮具/其他）
- 主体：双列瀑布流，每个卡片包含：缩略图、标题、分类标签、点赞数
- 下拉刷新：微信原生下拉刷新
- 上拉加载：触底加载更多，底部显示加载态
- 空状态：暖心插画 + "还没有作品哦"

#### 作品详情页

**决策**：轮播图 + 底部操作栏

- 顶部：图片/视频轮播（指示器 + 计数），支持左右滑动和双指缩放
- 中部：作品信息（标题、描述、分类、标签、创建时间）
- 底部固定操作栏：点赞按钮 + 评论按钮 + 分享按钮 + "我想要"按钮
- 评论区：作品信息下方展开，楼层式评论，作者回复带"作者"标签高亮

#### "我想要"交互

**决策**：底部弹出半屏面板

- 点击"我想要"按钮 → 底部弹出面板
- 面板内容：意向类型选择（喜欢想收藏/想定制类似的/想了解更多）+ 留言输入框 + 提交按钮
- 提交后显示成功提示 + "已收到你的心意"

#### 评论交互

**决策**：楼层式评论 + 内联回复

- 评论列表：头像 + 昵称 + 内容 + 时间 + 回复按钮
- 作者回复：带"作者"橙色标签，视觉高亮
- 发表评论：底部输入框，点击评论/回复按钮自动聚焦
- 回复评论：点击"回复"展开输入框，显示"@昵称"

#### 微信分享

**决策**：自定义分享卡片 + 小程序码

- 分享给好友：自定义卡片（作品缩略图 + 标题 + "来看我的手作"）
- 分享朋友圈：生成带小程序码的精美海报图（作品图 + 标题 + 小程序码）
- 落地页：直接进入作品详情页，自动展示评论区和互动按钮

### 9. Web管理后台设计决策

**决策**：Ant Design Pro + ProComponents

**理由**：
- 开箱即用的管理后台框架，减少搭建成本
- ProTable/ProForm等高级组件适配内容管理场景
- 内置权限管理、国际化、主题定制能力

**替代方案**：
- ~Arco Design Pro~：字节系方案，生态略小
- ~自建~：成本高，一期不划算

#### 作品编辑页面

**决策**：单页表单 + AI辅助按钮（二期启用）

- 左侧：作品预览区（实时预览卡片效果）
- 右侧：编辑表单（标题、描述、图片/视频上传、分类、标签）
- 每个文本字段旁预留"AI生成"按钮位置，一期显示为禁用态（灰色+提示"即将上线"），二期启用后点击流式展示AI生成结果
- 图片上传支持：拖拽排序 + 批量上传 + 裁剪预览
- 视频上传支持：进度显示 + 封面图选择

#### AI辅助集成（二期实现）

> 一期仅预留按钮占位和模块骨架，具体功能延后至二期。

- 作品描述字段旁："AI生成描述"按钮（一期禁用态）
- 标签字段旁："AI推荐标签"按钮（一期禁用态）
- 图片字段旁："AI图片优化建议"按钮（一期禁用态）
- 点击后调用AI接口，流式返回结果
- 生成结果可编辑修改后确认
- AI配置页：可自定义Prompt模板、选择AI模型、调节温度等参数

### 10. 数据模型设计决策

**核心模型**：

```
Craft（作品）
├── id: UUID
├── title: string（标题，必填，最长50字）
├── description: text（描述，最长2000字）
├── images: json（图片列表，[{url, thumbnailUrl, width, height, sort}]）
├── video: json（视频，{url, coverUrl, duration}）
├── category_id: FK → Category
├── tags: json（标签列表，["tag1", "tag2"]）
├── status: enum（draft/published/archived）
├── like_count: int（点赞数，缓存字段）
├── comment_count: int（评论数，缓存字段）
├── intent_count: int（意向数，缓存字段）
├── sort_order: int（排序权重）
├── created_at: timestamp
└── updated_at: timestamp

Comment（评论）
├── id: UUID
├── craft_id: FK → Craft
├── parent_id: FK → Comment（null为顶级评论）
├── content: text（评论内容，最长500字）
├── author_type: enum（admin/visitor）
├── author_name: string（昵称）
├── author_avatar: string（头像URL）
├── is_author_reply: boolean（是否为作者回复）
├── created_at: timestamp

Intent（意向）
├── id: UUID
├── craft_id: FK → Craft
├── type: enum（want_collect/want_custom/want_know_more）
├── message: text（留言，最长200字）
├── visitor_name: string
├── visitor_contact: string（可选联系方式）
├── status: enum（pending/viewed/replied）
├── created_at: timestamp

User（用户）
├── id: UUID
├── openid: string（微信openid，唯一）
├── nickname: string（默认"手作爱好者"）
├── avatar_url: string（默认头像URL）
├── has_profile: boolean（是否已完善头像昵称信息，默认false）
├── role: enum（admin/visitor）
├── created_at: timestamp

Category（分类）
├── id: UUID
├── name: string（分类名）
├── icon: string（图标）
├── sort_order: int
└── created_at: timestamp

AIConfig（AI配置，二期实现）
├── id: UUID
├── feature: enum（description/tags/image_suggestion）
├── prompt_template: text
├── model: string
├── temperature: float
├── is_enabled: boolean
├── updated_at: timestamp
```

### 11. API设计决策

**决策**：RESTful API + JWT认证

**方案**：
- 管理端API：`/api/admin/*`，需JWT Token + 管理员角色
- 小程序端API：`/api/mini/*`，需微信openid认证
- 分页方案：cursor-based分页（适用于瀑布流无限滚动场景）
- 文件上传：客户端直传存储（开发阶段MinIO/生产阶段OSS，通过StorageService抽象层切换，获取预签名URL后直传）
- AI接口：Server-Sent Events流式返回

### 12. 存储与CDN决策

**决策**：StorageService抽象层 + 开发阶段MinIO + 生产阶段OSS/CDN

**核心理念**：在NestJS中建立统一的`StorageService`抽象层，开发阶段使用MinIO（S3兼容本地存储），生产阶段切换为阿里云/腾讯云OSS+CDN，业务代码零修改。

#### 10.1 StorageService抽象层设计

```
src/storage/
├── storage.module.ts          # 模块注册，根据STORAGE_PROVIDER环境变量切换实现
├── storage.interface.ts       # IStorageService 接口定义
├── storage.service.ts         # 注入用的Service（代理到具体Provider）
├── providers/
│   ├── minio.provider.ts      # 开发阶段：MinIO实现
│   └── oss.provider.ts        # 生产阶段：阿里云/腾讯云OSS实现
└── image-processor.service.ts # 图片处理（Sharp，与Provider无关）
```

**IStorageService接口**：

| 方法 | 说明 |
|------|------|
| `getPresignedUrl(key, action, expires)` | 获取预签名上传/下载URL |
| `confirmUpload(key)` | 确认上传完成，触发图片后处理 |
| `getFileUrl(key)` | 获取文件公开访问URL |
| `deleteFile(key)` | 删除文件 |
| `generateThumbnails(key)` | 生成3种尺寸缩略图并存储 |

**环境切换**：仅需修改环境变量，无需改动业务代码

```
# 开发阶段
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=handcraft-dev
MINIO_SECRET_KEY=handcraft-dev-secret
MINIO_BUCKET=handcraft

# 生产阶段
STORAGE_PROVIDER=oss
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY=<生产key>
OSS_SECRET_KEY=<生产secret>
OSS_BUCKET=handcraft-prod
CDN_DOMAIN=https://cdn.handcraft.example.com
```

#### 10.2 开发阶段：MinIO

**方案**：
- 使用Docker部署MinIO，docker-compose一键启动
- MinIO完整兼容S3 API，客户端预签名URL直传模式与生产一致
- 自带Web管理控制台（:9001），可视化查看上传文件，便于调试
- 数据持久化到本地目录`./data/minio`

**docker-compose配置**：
```yaml
services:
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"    # S3 API端口
      - "9001:9001"    # Web管理控制台
    environment:
      MINIO_ROOT_USER: handcraft-dev
      MINIO_ROOT_PASSWORD: handcraft-dev-secret
    volumes:
      - ./data/minio:/data
    command: server /data --console-address ":9001"
```

**选择MinIO而非自建简易方案的理由**：
- 完整S3 API兼容，预签名URL、Bucket策略等与生产环境行为一致
- 生产级质量，不会因本地实现bug导致开发阶段踩坑
- Docker一键启动，无需额外编码
- 上线切换时只需改环境变量，无需任何代码修改

**替代方案**：
- ~自建简易文件服务~：需要实现预签名URL、Bucket管理等S3 API子集，开发成本高且行为可能与生产不一致
- ~LocalStack~：更重（~300MB内存），面向AWS全服务模拟，本项仅需S3

#### 10.3 图片处理：Sharp（开发+生产通用）

**决策**：使用Sharp库进行图片处理，而非依赖OSS图片处理服务

**理由**：
- Sharp在Node.js中性能极佳（基于libuv），处理速度远超ImageMagick
- 开发阶段MinIO无图片处理服务，Sharp填补此能力
- 生产阶段可继续使用Sharp（零切换成本），也可切换到OSS图片处理服务（通过StorageService抽象层）
- Sharp支持：缩略图生成、WebP格式转换、图片裁剪、元数据读取

**方案**：
- 上传完成后，`confirmUpload`触发`ImageProcessorService`
- 生成3种尺寸缩略图：200x200（列表缩略图）、400x400（瀑布流）、原图（详情页，可选WebP转换）
- 缩略图命名规则：`{原文件名}_{尺寸}.{格式}`，如`abc123_200x200.webp`
- 缩略图写回同一存储Provider（MinIO或OSS）

**替代方案**：
- ~OSS图片处理服务（生产专用）~：按请求付费，减少服务器CPU压力，但开发阶段不可用，需要额外适配
- ~ImageMagick~：性能差，需要系统级安装

#### 10.4 视频处理：开发阶段手动封面 + 生产阶段可演进

**决策**：开发阶段视频封面图采用手动上传，不引入ffmpeg

**理由**：
- 视频自动提取首帧需要ffmpeg，增加Docker镜像复杂度和依赖
- 视频功能非核心，开发阶段不应为此增加基础设施复杂度
- 手动上传封面图在编辑体验上也可接受（作品编辑表单中视频和封面图分开上传）

**演进路径**：
- 开发阶段：管理员手动上传视频封面图
- 生产阶段可选：引入阿里云MTS/函数计算自动提取封面图，或服务端集成ffmpeg

#### 10.5 生产阶段：OSS + CDN

**方案**：
- 上传流程不变：客户端 → 获取预签名URL → 直传OSS → 通知服务端 → 服务端触发图片处理
- 图片处理：可继续使用Sharp，或切换到OSS图片处理服务（URL参数方式，如`?x-oss-process=image/resize,w_400`）
- CDN：配置OSS域名为CDN源站，`getFileUrl`返回CDN域名URL
- 视频处理：可选接入函数计算自动提取封面图

#### 10.6 小程序端域名配置

- 开发阶段：小程序开发工具勾选"不校验合法域名"，MinIO的`localhost:9000`可正常访问
- 生产阶段：配置正式CDN域名到微信后台下载域名白名单

### 13. 开发流程规范：接口先行 + 并行开发 + 单元测试 + 联调

**决策**：每个涉及前后端协作的功能模块，严格遵循三阶段开发流程

**理由**：
- 接口先行确保前后端对契约达成一致，减少联调时发现接口不匹配的问题
- 并行开发提升效率，前端不依赖后端进度
- 单元测试保障代码质量，后端Service层核心逻辑必须有测试覆盖
- 联调阶段专注解决集成问题，而非发现基础bug

#### 13.1 三阶段开发流程

```
阶段1：接口定义
┌──────────────────────────────────────────────┐
│  1.1 定义API契约（NestJS Swagger装饰器）       │
│  1.2 生成OpenAPI文档（/api/docs）              │
│  1.3 前后端review接口定义，确认无误             │
└──────────────────────┬───────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
阶段2a：前端并行           阶段2b：后端并行
┌──────────────────┐    ┌──────────────────┐
│ 页面/组件开发     │    │ Service层逻辑实现 │
│ 对接Mock数据     │    │ 编写单元测试      │
│ 交互/样式打磨    │    │ 边界场景覆盖      │
└──────────────────┘    └──────────────────┘
           │                       │
           └───────────┬───────────┘
                       ▼
阶段3：联调
┌──────────────────────────────────────────────┐
│  3.1 前端切换到真实API                         │
│  3.2 端到端功能验证                            │
│  3.3 修复集成问题                              │
└──────────────────────────────────────────────┘
```

#### 13.2 接口定义方案

**决策**：NestJS Swagger装饰器 + 自动生成OpenAPI文档

**方案**：
- 使用`@nestjs/swagger`装饰器在Controller中定义接口契约
- 启动服务后访问`/api/docs`获取完整OpenAPI JSON
- Web前端基于OpenAPI JSON生成TypeScript类型定义（使用openapi-typescript）
- 小程序端参照API文档手动对接（小程序无法直接使用生成代码）
- 接口定义修改后，前端可重新生成类型，保持同步

**接口定义规范**：
- 每个API必须定义：路径、方法、请求体DTO、响应体DTO、错误码
- 使用class-validator装饰器同时完成参数校验和Swagger文档生成
- 分页接口统一使用cursor-based分页规范
- 错误响应统一格式：`{ code: string, message: string, details?: any }`

#### 13.3 单元测试要求

**服务端（NestJS + Jest）**：

| 层级 | 覆盖要求 | 说明 |
|------|---------|------|
| Controller | 可选 | 薄层，主要验证路由和参数校验 |
| Service | **必须，核心逻辑80%+覆盖率** | 业务逻辑核心，必须覆盖正常流程+边界+异常 |
| Guard/Middleware | 必须 | 权限校验逻辑必须测试 |
| Repository | 可选 | TypeORM查询逻辑，集成测试覆盖 |

**测试规范**：
- 每个Service方法必须测试：正常场景、边界条件、异常处理
- 使用Mock隔离外部依赖（数据库、Redis、第三方API、StorageService）
- 测试文件与源文件同目录：`craft.service.ts` → `craft.service.spec.ts`
- 运行命令：`npm run test`（单元测试）、`npm run test:e2e`（集成测试）

**前端（Web + 小程序）**：

| 层级 | 覆盖要求 | 说明 |
|------|---------|------|
| 工具函数 | 必须 | 请求工具类、格式化函数等纯逻辑 |
| 请求工具类 | 必须 | Token管理、401重试逻辑、错误处理 |
| 组件 | 可选 | 关键交互组件可写快照测试 |

**前端Mock方案**：
- Web端：使用MSW（Mock Service Worker）拦截API请求，返回Mock数据
- 小程序端：请求工具类中内置Mock模式，根据环境变量切换真实API/Mock数据
- Mock数据与OpenAPI文档中的DTO类型保持一致

#### 13.4 适用范围

**需要完整三阶段流程的模块**：
- 作品展示模块（小程序 + 服务端）
- 社交互动模块（小程序 + 服务端）
- "我想要"模块（小程序 + 服务端）
- 内容管理模块（Web + 服务端）
- 管理后台模块（Web + 服务端）
- 用户认证模块（小程序/Web + 服务端）

**二期需要三阶段流程的模块**：
- AI辅助模块（Web + 服务端）

**不需要三阶段流程的任务**：
- 项目基础设施搭建（纯配置）
- 设计系统与基础组件（纯前端组件，无API交互）
- 数据模型与数据库（纯后端基础设施）
- 优化与收尾（纯优化/部署）

## Risks / Trade-offs

- **微信小程序包大小限制（2MB主包+20MB分包）** → 采用分包策略，主包仅包含首页和TabBar页面，详情页和搜索放入分包，图片/视频走CDN不占包体积
- **图片加载性能** → CDN + 多尺寸缩略图 + 懒加载 + 渐进式加载，列表页仅加载400px宽度缩略图
- **AI生成内容质量不可控** → 二期实现时：生成结果仅作建议，必须人工确认/编辑后才能发布，AI配置支持自定义Prompt调优
- **微信分享触达有限** → 引导用户主动分享，优化分享卡片视觉设计，支持生成带小程序码的海报图
- **视频存储成本** → 一期限制视频大小（≤50MB）和时长（≤3分钟），使用H.264编码压缩
- **单管理员架构扩展性** → 数据模型预留user_id字段，一期硬编码管理员，后续可平滑迁移至多作者
- **Redis缓存一致性** → 点赞/评论数使用Redis计数 + 定时回写DB，允许短暂数据不一致（最终一致性）
- **开发阶段MinIO数据不迁移到生产** → 开发阶段上传的文件为测试数据，上线后重新上传正式内容；MinIO仅作为开发期存储，不涉及数据迁移
- **Sharp图片处理占用服务器CPU** → 图片处理为异步任务，不阻塞API响应；若生产阶段CPU压力大，可切换到OSS图片处理服务或独立Worker进程
- **视频封面图开发阶段需手动上传** → 降低开发复杂度，避免引入ffmpeg依赖；生产阶段可演进为自动提取

### 14. Docker部署与环境配置决策

**决策**：开发阶段本地运行应用 + Docker基础设施服务；预发布/生产阶段全容器化部署；数据使用Docker named volume持久化

**核心理念**：开发阶段方便断点调试和热重载（应用本地运行），基础设施服务（PostgreSQL/Redis/MinIO）统一Docker化；发布阶段全容器化保证环境一致性

#### 14.1 多环境策略

| 维度 | 开发(dev) | 预发布(staging) | 生产(prod) |
|------|-----------|-----------------|------------|
| **API Server** | 本地运行(nest start --watch) | Docker容器 | Docker容器 |
| **Web Admin** | 本地运行(npm run dev) | Docker容器+Nginx | CDN静态部署 |
| **小程序** | 微信开发者工具 | 微信开发者工具 | 微信审核发布 |
| **PostgreSQL** | Docker容器(named volume) | Docker/云RDS | 云RDS |
| **Redis** | Docker容器(named volume) | Docker/云Redis | 云Redis |
| **MinIO** | Docker容器(named volume) | Docker容器 | 阿里云OSS |
| **数据初始化** | 自动迁移+种子数据 | 迁移脚本 | 迁移脚本(审慎) |
| **HTTPS** | 不需要 | 需要 | 需要 |
| **日志** | 控制台输出 | 文件日志 | 文件+云日志服务 |

#### 14.2 开发环境Docker Compose

开发环境仅容器化基础设施服务，应用本地运行：

```yaml
# docker-compose.dev.yml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: handcraft
      POSTGRES_USER: handcraft
      POSTGRES_PASSWORD: handcraft-dev
    volumes:
      - handcraft-pg-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U handcraft"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - handcraft-redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: handcraft-dev
      MINIO_ROOT_PASSWORD: handcraft-dev-secret
    volumes:
      - handcraft-minio-data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 5s
      retries: 5

  minio-init:
    image: minio/mc:latest
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
      mc alias set myminio http://minio:9000 handcraft-dev handcraft-dev-secret;
      mc mb --ignore-existing myminio/handcraft;
      "

volumes:
  handcraft-pg-data:
  handcraft-redis-data:
  handcraft-minio-data:
```

**关键特性**：
- named volume持久化数据，`docker compose down`数据不丢失，`docker compose down -v`才清除
- healthcheck确保服务就绪后再启动依赖服务
- minio-init容器自动创建handcraft bucket（一次性任务）
- 应用服务不在此文件中，本地运行

#### 14.3 预发布/生产环境Docker Compose

预发布和生产环境全容器化，增加应用服务和Nginx：

```yaml
# docker-compose.prod.yml（示例结构）
services:
  postgres:    # 生产环境可能使用云RDS，此服务可移除
    ...
  redis:       # 生产环境可能使用云Redis，此服务可移除
    ...
  api-server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - STORAGE_PROVIDER=oss
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  web-admin:
    build:
      context: ./web-admin
      dockerfile: Dockerfile
    # 静态资源构建后由Nginx托管

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/certs:/etc/nginx/certs
    depends_on:
      - api-server
      - web-admin
```

#### 14.4 环境变量管理

**决策**：使用`.env.dev`/`.env.staging`/`.env.prod`三套环境变量文件

**方案**：
- 项目根目录提供`.env.example`模板，包含所有配置项和注释说明
- 各环境文件`.env.dev`/`.env.staging`/`.env.prod`不提交到Git（.gitignore排除）
- docker-compose通过`--env-file`指定环境文件
- 本地运行NestJS/Web时通过`.env.dev`加载环境变量

```
.env.example          # 提交到Git，模板+注释
.env.dev              # 不提交，开发环境配置
.env.staging          # 不提交，预发布环境配置  
.env.prod             # 不提交，生产环境配置
```

**环境变量分类**：

| 类别 | 变量 | 说明 |
|------|------|------|
| 应用 | NODE_ENV, APP_PORT | 运行环境、端口 |
| 数据库 | DATABASE_HOST/PORT/NAME/USER/PASSWORD | PostgreSQL连接 |
| Redis | REDIS_HOST/PORT/PASSWORD | Redis连接 |
| 存储 | STORAGE_PROVIDER, MINIO_*/OSS_* | 存储服务配置 |
| 微信 | WX_APPID, WX_SECRET | 小程序登录 |
| AI | AI_MODEL, AI_API_KEY, AI_BASE_URL | AI服务配置 |
| JWT | JWT_SECRET, JWT_EXPIRES_IN | Token配置 |

#### 14.5 配置文档结构

```
docs/
├── development.md      # 开发环境：启动步骤、环境变量、常见问题
├── staging.md          # 预发布环境：部署流程、配置差异
└── production.md       # 生产环境：部署流程、安全配置、监控

deploy/
├── docker-compose.dev.yml      # 开发环境（仅基础设施）
├── docker-compose.staging.yml  # 预发布环境（全容器化）
├── docker-compose.prod.yml     # 生产环境（全容器化+云服务）
└── .env.example                # 环境变量模板

server/
├── Dockerfile                   # NestJS生产镜像
└── ...

web-admin/
├── Dockerfile                   # React构建+静态部署镜像
└── ...
```

#### 14.6 开发环境启动流程

```bash
# 1. 复制环境变量模板
cp deploy/.env.example .env.dev
# 编辑 .env.dev 填入开发配置

# 2. 启动基础设施服务
docker compose -f deploy/docker-compose.dev.yml --env-file .env.dev up -d

# 3. 等待服务就绪（healthcheck通过）
docker compose -f deploy/docker-compose.dev.yml ps  # 查看状态

# 4. 本地启动API Server（热重载）
cd server && npm run start:dev

# 5. 本地启动Web Admin（HMR）
cd web-admin && npm run dev

# 6. 微信开发者工具打开小程序项目

# 停止开发环境
docker compose -f deploy/docker-compose.dev.yml down      # 停止服务，数据保留
docker compose -f deploy/docker-compose.dev.yml down -v   # 停止服务，清除数据
```

**替代方案**：
- ~开发阶段应用也容器化~：调试不便，无法断点，热重载有延迟
- ~使用本地安装PostgreSQL/Redis~：环境不一致，切换机器需要重新安装配置
