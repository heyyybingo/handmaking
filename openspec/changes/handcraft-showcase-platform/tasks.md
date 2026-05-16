## 1. 项目基础设施搭建

- [x] 1.1 编写开发环境配置文档（docs/development.md：启动步骤、环境变量说明、常见问题排查）
- [x] 1.2 编写预发布环境配置文档（docs/staging.md：部署流程、与开发环境配置差异）
- [x] 1.3 编写生产环境配置文档（docs/production.md：部署流程、安全配置、监控告警）
- [x] 1.4 编写开发环境docker-compose（deploy/docker-compose.dev.yml：PostgreSQL+Redis+MinIO，named volume持久化，healthcheck，minio-init自动建bucket）
- [x] 1.5 编写环境变量模板（deploy/.env.example：包含所有配置项+注释说明，提交到Git）
- [x] 1.6 配置.gitignore（排除.env.dev/.env.staging/.env.prod、node_modules、dist等）
- [x] 1.7 初始化NestJS服务端项目，配置TypeScript、ESLint、Prettier
- [x] 1.8 配置Jest测试框架（NestJS内置），设置覆盖率阈值（Service层80%+）
- [x] 1.9 配置TypeORM连接PostgreSQL（连接配置、autoLoadEntities、synchronize开发模式）
- [x] 1.10 配置Redis连接，封装缓存工具类
- [x] 1.11 配置NestJS模块化结构（craft-showcase/content-management/social-interaction/i-want-feature/ai-assistant/user-auth/admin-dashboard）
- [x] 1.12 配置@nestjs/swagger，设置全局Swagger插件，生成基础OpenAPI文档（/api/docs）
- [x] 1.13 初始化微信小程序项目，配置AppID、分包策略（主包+详情分包）、全局样式变量
- [x] 1.14 初始化Web管理后台项目，基于Ant Design Pro脚手架，配置主题色为暖铜色#C4956A
- [x] 1.15 Web端配置Vitest测试框架 + MSW（Mock Service Worker）
- [x] 1.16 Web端配置openapi-typescript，基于服务端OpenAPI JSON生成TypeScript类型
- [x] 1.17 配置项目README（项目简介、技术栈、快速启动指南，引用docs/development.md）
- [x] 1.18 实现StorageService抽象层（IStorageService接口 + StorageModule + 根据STORAGE_PROVIDER环境变量切换Provider）
- [x] 1.19 实现MinIO StorageProvider（预签名URL生成、文件上传确认、文件删除、文件URL获取）
- [x] 1.20 实现OSS StorageProvider（阿里云/腾讯云SDK集成，接口与MinIO Provider一致，生产阶段使用）
- [x] 1.21 实现ImageProcessorService（Sharp：3种尺寸缩略图生成200x200/400x400/原图，WebP格式转换）
- [x] 1.22 StorageService + ImageProcessorService单元测试

## 2. 设计系统与基础组件

- [x] 2.1 小程序端：定义全局样式变量（色彩系统、字体系统、间距系统、圆角系统）
- [x] 2.2 小程序端：封装按钮组件（主按钮/次要按钮/文字按钮，含按压反馈动效）
- [x] 2.3 小程序端：封装内容卡片组件（白色背景+16rpx圆角+一级阴影+24rpx内边距）
- [x] 2.4 小程序端：封装标签组件（8rpx圆角，暖铜色/浅驼色/青瓷绿变体）
- [x] 2.5 小程序端：封装头像组件（50%圆形裁剪，支持默认头像）
- [x] 2.6 小程序端：封装底部TabBar组件（首页/分类/我的，暖铜色高亮态）
- [x] 2.7 小程序端：封装自定义导航栏组件（标题+返回按钮，适配状态栏高度）
- [x] 2.8 小程序端：封装空状态组件（暖心插画+提示文案）
- [x] 2.9 小程序端：封装骨架屏组件（浅驼色#E8D5C0脉冲闪烁效果）
- [x] 2.10 小程序端：封装加载更多组件（加载中/已到底/加载失败三种状态）
- [x] 2.11 Web端：配置Ant Design Pro主题token（主色#C4956A、辅助色、圆角、字体）
- [ ] 2.12 Web端：封装AI流式结果展示组件（SSE接收+逐字渲染+加载动画）——二期实现

## 3. 数据模型与数据库

- [x] 3.1 创建Craft数据模型（id/title/description/images/video/category_id/tags/status/like_count/comment_count/intent_count/sort_order/timestamps）
- [x] 3.2 创建Category数据模型（id/name/icon/sort_order/created_at）
- [x] 3.3 创建Comment数据模型（id/craft_id/parent_id/content/author_type/author_name/author_avatar/is_author_reply/created_at）
- [x] 3.4 创建Intent数据模型（id/craft_id/type/message/visitor_name/visitor_contact/status/created_at）
- [x] 3.5 创建User数据模型（id/openid/nickname/avatar_url/has_profile/role/created_at）
- [x] 3.6 创建AIConfig数据模型（id/feature/prompt_template/model/temperature/is_enabled/updated_at）
- [x] 3.7 创建SystemConfig数据模型（id/key/value/updated_at）
- [x] 3.8 编写数据库迁移脚本，插入默认管理员账号和默认分类数据

## 4. 用户认证模块

### 4.1 接口定义

- [x] 4.1.1 定义微信登录API契约（POST /api/mini/auth/login，请求体{code}，响应体{accessToken, refreshToken, hasProfile}）
- [x] 4.1.2 定义Token刷新API契约（POST /api/mini/auth/refresh，请求体{refreshToken}，响应体{accessToken}）
- [x] 4.1.3 定义用户信息更新API契约（PUT /api/mini/auth/profile，请求体{avatarUrl, nickname}，支持头像文件上传）
- [x] 4.1.4 定义管理员登录API契约（POST /api/admin/auth/login，请求体{username, password}，响应体{token}）
- [x] 4.1.5 定义管理员密码修改API契约（PUT /api/admin/auth/password，请求体{oldPassword, newPassword}）

### 4.2 前端并行开发

- [x] 4.2.1 小程序端：实现静默登录流程（App.onLaunch中自动调用wx.login → 后端换Token → 本地存储）
- [x] 4.2.2 小程序端：封装请求工具类（自动携带Token、401触发静默登录重试、403提示无权限、Mock模式支持）
- [x] 4.2.3 小程序端：实现Token本地存储与自动刷新（Token过期前1天自动续期）
- [x] 4.2.4 小程序端：实现"完善信息"半屏面板组件（button open-type="chooseAvatar" + input type="nickname" + 确认/跳过）
- [x] 4.2.5 小程序端：实现首次互动拦截逻辑（has_profile=false时弹出完善信息面板，完成后继续执行互动）
- [x] 4.2.6 小程序端：实现"我的"页面用户信息展示（含未完善信息引导入口）
- [x] 4.2.7 Web端：实现管理员登录页面（账号密码表单 + JWT存储 + 登录失败锁定 + 自动跳转）
- [ ] 4.2.8 请求工具类单元测试（Token管理、401重试逻辑、Mock模式切换）

### 4.3 后端并行开发

- [x] 4.3.1 实现微信静默登录API（接收wx.login的code，调用微信code2Session接口换取openid，创建/查询用户，签发accessToken+refreshToken）
- [x] 4.3.2 实现Token签发逻辑（accessToken 7天 + refreshToken 30天，载荷含userId/openid/role/has_profile）
- [x] 4.3.3 实现Token刷新API（接收refreshToken，验证有效后签发新accessToken）
- [x] 4.3.4 实现JWT守卫（AuthGuard），解析Token并注入用户信息到请求上下文
- [x] 4.3.5 实现角色守卫（RolesGuard），校验admin/visitor角色权限
- [x] 4.3.6 实现用户信息更新API（更新头像、昵称，设置has_profile=true）
- [x] 4.3.7 实现管理员账号密码登录API（验证账密，签发管理后台JWT Token 24小时）
- [x] 4.3.8 AuthService单元测试（登录逻辑、Token签发/验证/刷新、角色校验）
- [x] 4.3.9 AuthGuard/RolesGuard单元测试（Token解析、角色权限校验、未授权拒绝）

### 4.4 联调

- [ ] 4.4.1 小程序端对接微信登录API，端到端验证静默登录+Token刷新流程
- [ ] 4.4.2 小程序端对接完善信息API，端到端验证头像昵称上传+首次互动拦截
- [x] 4.4.3 Web端对接管理员登录API，端到端验证登录+Token失效跳转

## 5. 作品展示模块

### 5.1 接口定义

- [x] 5.1.1 定义作品列表查询API契约（GET /api/mini/crafts，cursor分页，分类筛选参数，响应体含作品列表+分页游标）
- [x] 5.1.2 定义作品详情查询API契约（GET /api/mini/crafts/:id，响应体含作品完整信息+评论数+点赞数）
- [x] 5.1.3 定义分类列表查询API契约（GET /api/mini/categories，响应体含分类列表+各分类作品数）
- [x] 5.1.4 定义搜索API契约（GET /api/mini/crafts/search，关键词参数，cursor分页）

### 5.2 前端并行开发

- [x] 5.2.1 小程序端：实现自定义双列瀑布流组件（按高度最短列分配算法，支持图片预计算高度）
- [x] 5.2.2 小程序端：实现首页作品列表页（瀑布流 + 分类Tab横向滚动 + 下拉刷新 + 上拉加载更多，对接Mock数据）
- [x] 5.2.3 小程序端：实现作品卡片组件（缩略图+标题+分类标签+点赞数）
- [x] 5.2.4 小程序端：实现作品详情页（图片/视频轮播组件，含指示器和计数，支持滑动和缩放，对接Mock数据）
- [x] 5.2.5 小程序端：实现详情页作品信息展示区（标题、描述、分类标签、创建时间）
- [x] 5.2.6 小程序端：实现详情页底部固定操作栏（点赞+评论+分享+"我想要"）
- [x] 5.2.7 小程序端：实现分类浏览页面（分类列表 + 分类下作品列表，对接Mock数据）
- [x] 5.2.8 小程序端：实现搜索页面（搜索输入框 + 搜索历史 + 搜索结果列表，对接Mock数据）
- [x] 5.2.9 小程序端：实现个人主页（作者信息 + 作品网格展示，对接Mock数据）

### 5.3 后端并行开发

- [x] 5.3.1 实现作品列表查询Service + API（cursor-based分页，支持分类筛选和关键词搜索）
- [x] 5.3.2 实现作品详情查询Service + API
- [x] 5.3.3 实现分类列表查询Service + API（含每个分类的作品数量统计）
- [x] 5.3.4 实现搜索Service + API（PostgreSQL全文搜索，支持标题和描述匹配）
- [x] 5.3.5 CraftService单元测试（列表查询分页逻辑、分类筛选、全文搜索、边界条件）
- [x] 5.3.6 CategoryService单元测试（分类列表、作品数统计）

### 5.4 联调

- [ ] 5.4.1 小程序端对接真实API，验证首页瀑布流加载+分类筛选+下拉刷新+上拉加载
- [ ] 5.4.2 小程序端对接作品详情API，验证详情页数据展示
- [ ] 5.4.3 小程序端对接搜索API，验证搜索功能端到端流程
- [ ] 5.4.4 小程序端对接分类和个人主页API，验证页面展示

## 6. 社交互动模块

### 6.1 接口定义

- [x] 6.1.1 定义点赞API契约（POST/DELETE /api/mini/crafts/:id/like，响应体含当前点赞数）
- [x] 6.1.2 定义评论CRUD API契约（GET/POST /api/mini/crafts/:id/comments，DELETE /api/mini/comments/:id）
- [x] 6.1.3 定义作者回复API契约（POST /api/admin/comments/:id/reply，标记is_author_reply）

### 6.2 前端并行开发

- [x] 6.2.1 小程序端：实现点赞功能（点赞/取消点赞切换，爱心缩放弹跳动画200ms，暖铜色填充，对接Mock数据）
- [x] 6.2.2 小程序端：实现评论区展示（楼层式评论列表，分页加载，作者回复带橙色"作者"标签，对接Mock数据）
- [x] 6.2.3 小程序端：实现发表评论功能（底部输入框，自动聚焦，发送后添加到列表顶部，对接Mock数据）
- [x] 6.2.4 小程序端：实现回复评论功能（点击回复展开输入框，显示@昵称，对接Mock数据）
- [x] 6.2.5 小程序端：实现微信分享给好友（onShareAppMessage，自定义卡片：缩略图+标题+"来看我的手作"）
- [x] 6.2.6 小程序端：实现朋友圈海报生成（作品主图+标题+作者+小程序码，Canvas绘制保存相册）

### 6.3 后端并行开发

- [x] 6.3.1 实现点赞Service + API（点赞/取消点赞，Redis计数缓存+定时回写DB）
- [x] 6.3.2 实现评论CRUD Service + API（发表评论、查询评论列表、删除评论）
- [x] 6.3.3 实现作者回复Service + API（回复评论，标记is_author_reply=true）
- [x] 6.3.4 LikeService单元测试（点赞/取消逻辑、Redis缓存计数、并发场景）
- [x] 6.3.5 CommentService单元测试（发表/查询/删除评论、作者回复、分页逻辑）

### 6.4 联调

- [ ] 6.4.1 小程序端对接点赞API，验证点赞/取消+计数更新+动画
- [ ] 6.4.2 小程序端对接评论API，验证发表评论+评论列表+回复功能
- [ ] 6.4.3 小程序端验证微信分享卡片展示和落地页跳转

## 7. "我想要"模块

### 7.1 接口定义

- [x] 7.1.1 定义意向提交API契约（POST /api/mini/crafts/:id/intent，请求体{type, message}，重复提交校验）
- [x] 7.1.2 定义意向查询API契约（GET /api/admin/intents，按类型/状态筛选，cursor分页）
- [x] 7.1.3 定义意向状态更新API契约（PUT /api/admin/intents/:id/status，请求体{status}）
- [x] 7.1.4 定义意向统计API契约（GET /api/admin/intents/stats，响应体含总数/今日新增/待处理/各类型占比）

### 7.2 前端并行开发

- [x] 7.2.1 小程序端：实现"我想要"底部半屏弹出面板（意向类型选择：喜欢想收藏/想定制类似的/想了解更多，对接Mock数据）
- [x] 7.2.2 小程序端：实现意向留言输入和提交（留言最长200字，提交成功提示"已收到你的心意"，对接Mock数据）
- [x] 7.2.3 小程序端：实现重复提交检测（同一用户同一作品只可提交一次意向）

### 7.3 后端并行开发

- [x] 7.3.1 实现意向提交Service + API（验证重复提交，记录意向类型和留言）
- [x] 7.3.2 实现意向查询Service + API（支持按类型、状态筛选，cursor分页）
- [x] 7.3.3 实现意向状态更新Service + API（标记已查看/已回复）
- [x] 7.3.4 实现意向统计Service + API（总数、今日新增、待处理数、各类型占比）
- [x] 7.3.5 IntentService单元测试（提交逻辑+重复校验、查询筛选、状态更新、统计计算）

### 7.4 联调

- [ ] 7.4.1 小程序端对接意向提交API，验证提交+重复校验+成功提示
- [x] 7.4.2 Web端对接意向管理API，验证列表查看+状态更新（在管理后台联调中统一验证）

## 8. 内容管理模块

### 8.1 接口定义

- [x] 8.1.1 定义作品CRUD API契约（POST/PUT/DELETE /api/admin/crafts，GET /api/admin/crafts列表查询）
- [x] 8.1.2 定义分类CRUD API契约（POST/PUT/DELETE /api/admin/categories，GET /api/admin/categories）
- [x] 8.1.3 定义文件上传API契约（POST /api/admin/files/presign获取预签名URL，POST /api/admin/files/confirm确认上传）
- [x] 8.1.4 定义作品批量操作API契约（POST /api/admin/crafts/batch，请求体{ids, action}）

### 8.2 前端并行开发

- [x] 8.2.1 Web端：实现作品列表页（ProTable，支持列表/网格视图切换、分类筛选、状态筛选、搜索，对接MSW Mock）
- [x] 8.2.2 Web端：实现作品创建/编辑页面（表单：标题+描述+图片/视频上传+分类+标签，左侧实时预览卡片，对接MSW Mock）
- [x] 8.2.3 Web端：实现图片上传组件（批量选择、拖拽排序、裁剪预览、上传进度）
- [x] 8.2.4 Web端：实现视频上传组件（文件选择、上传进度、视频封面图手动上传区域）
- [x] 8.2.5 Web端：实现分类管理页面（分类列表、创建/编辑弹窗、拖拽排序、删除确认，对接MSW Mock）
- [x] 8.2.6 Web端：实现作品批量操作（勾选多行 → 批量上架/下架/移动分类/删除）

### 8.3 后端并行开发

- [x] 8.3.1 实现作品CRUD Service + API（创建/编辑/删除/查询，含软删除，管理员权限校验）
- [x] 8.3.2 实现分类CRUD Service + API（创建/编辑/删除/排序，删除前校验是否有作品关联）
- [x] 8.3.3 实现文件上传流程Service + API（通过StorageService获取预签名URL → 客户端直传MinIO/OSS → 回调确认 → 触发ImageProcessorService）
- [x] 8.3.4 集成ImageProcessorService到文件上传流程（上传确认后自动生成缩略图，缩略图写回StorageProvider）
- [x] 8.3.5 实现视频上传处理（大小校验≤50MB，封面图需手动上传，不引入ffmpeg自动提取）
- [x] 8.3.6 实现作品批量操作Service + API（批量上架/下架/移动分类/删除）
- [x] 8.3.7 CraftService单元测试（CRUD逻辑、软删除、批量操作、权限校验）
- [x] 8.3.8 CategoryService单元测试（CRUD逻辑、删除关联校验、排序）
- [x] 8.3.9 FileService单元测试（预签名URL生成、上传确认流程、图片处理触发）

### 8.4 联调

- [x] 8.4.1 Web端对接作品CRUD API，验证创建/编辑/删除/列表查询全流程
- [x] 8.4.2 Web端对接文件上传API，验证图片上传+缩略图生成+视频上传+封面图上传
- [x] 8.4.3 Web端对接分类管理API，验证分类CRUD+排序
- [x] 8.4.4 Web端对接批量操作API，验证批量上架/下架/移动分类/删除

## 9. 管理后台模块

### 9.1 接口定义

- [x] 9.1.1 定义仪表盘统计API契约（GET /api/admin/dashboard/stats，响应体含各指标总数+近7天趋势）
- [x] 9.1.2 定义评论管理API契约（GET /api/admin/comments列表+按作品筛选，POST /api/admin/comments/:id/reply回复，DELETE /api/admin/comments/:id删除）
- [x] 9.1.3 定义意向管理API契约（复用7.1中定义的意向查询/状态更新/统计API）
- [x] 9.1.4 定义系统配置API契约（GET/PUT /api/admin/config，请求/响应体含站点名称、公告、通知设置）

### 9.2 前端并行开发

- [x] 9.2.1 Web端：实现数据概览仪表盘（5个统计卡片：作品数/点赞数/评论数/意向数/今日访客数，对接MSW Mock）
- [x] 9.2.2 Web端：实现统计趋势图（点击卡片展开近7天折线图，使用Ant Design Charts，对接MSW Mock）
- [x] 9.2.3 Web端：实现评论管理页面（评论列表、按作品筛选、回复评论、删除评论，对接MSW Mock）
- [x] 9.2.4 Web端：实现意向管理页面（意向列表、按类型/状态筛选、标记已查看/已回复，对接MSW Mock）
- [x] 9.2.5 Web端：实现系统配置页面（站点名称、公告、通知设置，对接MSW Mock）
- [x] 9.2.6 MSW Mock 数据完善：所有 Web 管理后台模块（Dashboard/Crafts/Categories/Comments/Intents/Files/Config）的 Mock 接口均已实现，包含 22 条作品、6 个分类、17 条评论、12 条意向的完整 Mock 数据集，支持 CRUD、分页、筛选、批量操作

### 9.3 后端并行开发

- [x] 9.3.1 实现仪表盘统计Service + API（各指标总数+近7天趋势数据）
- [x] 9.3.2 实现系统配置CRUD Service + API
- [x] 9.3.3 DashboardService单元测试（统计计算逻辑、趋势数据聚合）
- [x] 9.3.4 SystemConfigService单元测试（配置读写逻辑）

### 9.4 联调

- [x] 9.4.1 Web端对接仪表盘统计API，验证数据卡片+趋势图展示
- [x] 9.4.2 Web端对接评论管理API，验证评论列表+回复+删除
- [x] 9.4.3 Web端对接意向管理API，验证意向列表+状态更新
- [x] 9.4.4 Web端对接系统配置API，验证配置读写

## 10. AI辅助模块（二期实现）

> 一期仅预留模块骨架和禁用态按钮占位，具体功能延后至二期。

### 10.1 接口定义

- [x] 10.1.1 定义AI配置CRUD API契约（GET/PUT /api/admin/ai-config，按feature查询/更新）
- [x] 10.1.2 定义AI描述生成API契约（POST /api/admin/ai/generate-description，SSE流式响应）
- [x] 10.1.3 定义AI标签建议API契约（POST /api/admin/ai/suggest-tags，响应体含推荐标签列表）
- [x] 10.1.4 定义AI图片优化建议API契约（POST /api/admin/ai/image-suggestion，响应体含优化建议文字）

### 10.2 前端并行开发

- [x] 10.2.1 Web端：实现AI配置管理页面（功能开关、Prompt编辑、模型下拉选择、温度滑块、恢复默认按钮，对接MSW Mock）
- [x] 10.2.2 Web端：作品编辑页集成"AI生成描述"按钮（点击调用SSE接口，流式展示结果，确认/重新生成，对接Mock SSE）
- [x] 10.2.3 Web端：作品编辑页集成"AI推荐标签"按钮（点击展示推荐标签，点击标签添加到标签列表，对接MSW Mock）
- [x] 10.2.4 Web端：作品编辑页集成"AI图片优化建议"按钮（点击展示优化建议弹窗，对接MSW Mock）

### 10.3 后端并行开发

- [x] 10.3.1 实现AI配置CRUD Service + API（获取/更新Prompt模板、模型选择、温度参数、功能开关）
- [x] 10.3.2 实现AI SSE流式调用基础Service（封装大模型API调用，支持SSE响应格式）
- [x] 10.3.3 实现AI描述生成Service + 接口（接收图片URL+标签，使用Prompt模板调用AI，SSE流式返回）
- [x] 10.3.4 实现AI标签建议Service + 接口（接收图片URL+描述，返回3-5个推荐标签）
- [x] 10.3.5 实现AI图片优化建议Service + 接口（接收图片URL，返回优化建议文字）
- [x] 10.3.6 AIConfigService单元测试（配置CRUD逻辑、功能开关判断）
- [x] 10.3.7 AIService单元测试（Prompt模板组装、AI调用参数构造，Mock外部AI API）

### 10.4 联调

- [ ] 10.4.1 Web端对接AI配置API，验证功能开关+参数保存
- [ ] 10.4.2 Web端对接AI描述生成SSE接口，验证流式展示+确认/重新生成
- [ ] 10.4.3 Web端对接AI标签建议和图片优化建议API，验证推荐结果展示

## 11. 优化与收尾

- [x] 11.1 小程序端：图片懒加载与渐进式加载优化（列表页仅加载400px缩略图，详情页按需加载原图）
- [x] 11.2 小程序端：全局空状态页面适配（无作品/无评论/无搜索结果/无分类等场景）
- [x] 11.3 小程序端：全局错误处理与网络异常提示
- [x] 11.4 服务端：API限流配置（Rate Limiter，按IP和用户维度）
- [x] 11.5 服务端：Redis缓存策略优化（热点数据缓存、点赞数定时回写DB）
- [x] 11.6 服务端：全局异常过滤器和日志中间件
- [x] 11.7 Web端：全局错误处理和未授权跳转
- [x] 11.8 编写NestJS Dockerfile（多阶段构建：依赖安装→编译→运行，基于node:20-alpine）
- [x] 11.9 编写Web Admin Dockerfile（多阶段构建：依赖安装→构建→Nginx托管静态资源）
- [x] 11.10 编写预发布docker-compose（deploy/docker-compose.staging.yml：全容器化+Nginx反向代理+HTTPS）
- [x] 11.11 编写生产docker-compose（deploy/docker-compose.prod.yml：全容器化，PostgreSQL/Redis替换为云服务配置）
- [x] 11.12 编写Nginx配置（API反向代理+Web Admin静态资源托管+HTTPS证书配置）
- [x] 11.13 微信小程序代码审核与提审准备
