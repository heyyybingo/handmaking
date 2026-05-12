## ADDED Requirements

### Requirement: 静默登录
系统 SHALL 在用户打开小程序时自动完成静默登录，用户无需任何手动操作即可浏览内容。

#### Scenario: 小程序启动时静默登录
- **WHEN** 用户打开小程序
- **THEN** 系统自动调用wx.login获取临时code，发送到后端换取accessToken和refreshToken，完成静默登录

#### Scenario: 新用户首次静默登录
- **WHEN** 后端检测到该openid不存在对应用户记录
- **THEN** 自动创建用户记录（角色=visitor，昵称="手作爱好者"，has_profile=false），返回Token

#### Scenario: 老用户静默登录
- **WHEN** 后端检测到该openid已存在用户记录
- **THEN** 直接返回Token（含userId、openid、role、has_profile），不修改用户信息

#### Scenario: 静默登录失败降级
- **WHEN** 静默登录失败（网络异常、code无效等）
- **THEN** 系统使用本地缓存的Token继续使用，若本地Token也失效则进入游客模式（仅可浏览，不可互动）

### Requirement: 未登录用户浏览
系统 SHALL 允许未登录用户自由浏览所有公开内容。

#### Scenario: 未登录用户浏览首页
- **WHEN** 未登录用户进入首页
- **THEN** 正常展示作品瀑布流、分类浏览、搜索功能，不弹出任何登录提示

#### Scenario: 未登录用户查看作品详情
- **WHEN** 未登录用户点击进入作品详情页
- **THEN** 正常展示作品信息、评论列表，底部操作栏中点赞/评论/我想要按钮显示为可点击但需登录

#### Scenario: 未登录用户尝试互动
- **WHEN** 未登录用户点击点赞/评论/我想要等互动操作
- **THEN** 系统触发静默登录流程，登录成功后继续执行互动操作

### Requirement: 首次互动完善信息
系统 SHALL 在用户首次进行互动操作时，弹出半屏面板引导完善头像和昵称。

#### Scenario: 首次互动弹出完善信息面板
- **WHEN** 已登录但has_profile=false的用户首次点击点赞/评论/我想要
- **THEN** 系统弹出半屏面板，包含头像选择按钮（button open-type="chooseAvatar"）和昵称输入框（input type="nickname"），以及"确认"和"跳过"按钮

#### Scenario: 用户选择头像
- **WHEN** 用户在完善信息面板中点击头像选择按钮
- **THEN** 系统调起微信头像选择器，用户选择图片后显示在面板中

#### Scenario: 用户输入昵称
- **WHEN** 用户在完善信息面板的昵称输入框中输入内容
- **THEN** 系统使用微信昵称填写能力（input type="nickname"），用户可从微信昵称列表快速选择，或手动输入2-20字符的自定义昵称

#### Scenario: 用户确认完善信息
- **WHEN** 用户选择头像和输入昵称后点击"确认"
- **THEN** 系统将头像上传到StorageService、更新用户nickname和avatar_url、设置has_profile=true、关闭面板、继续执行互动操作

#### Scenario: 用户跳过完善信息
- **WHEN** 用户点击"跳过"
- **THEN** 系统关闭面板，使用默认头像和"手作爱好者"昵称继续执行互动操作，has_profile保持false，后续互动不再弹出面板

#### Scenario: 仅填写头像或昵称之一
- **WHEN** 用户仅选择头像但未输入昵称，或仅输入昵称但未选择头像
- **THEN** "确认"按钮仍可用，未填写的部分保留默认值，保存后设置has_profile=true

### Requirement: 个人信息管理
系统 SHALL 允许用户在"我的"页面查看和修改自己的基本信息。

#### Scenario: 查看个人信息
- **WHEN** 用户进入"我的"页面
- **THEN** 系统展示用户头像、昵称、我的点赞数、我的评论数

#### Scenario: 未完善信息用户的"我的"页面
- **WHEN** has_profile=false的用户进入"我的"页面
- **THEN** 展示默认头像和"手作爱好者"昵称，并显示"点击完善个人信息"引导入口

#### Scenario: 修改头像
- **WHEN** 用户点击头像进行修改
- **THEN** 系统使用button open-type="chooseAvatar"调起微信头像选择器，用户选择图片后上传并更新头像

#### Scenario: 修改昵称
- **WHEN** 用户点击昵称进行修改
- **THEN** 系统弹出编辑弹窗，使用input type="nickname"，用户输入新昵称（2-20字符）后保存

### Requirement: Token管理
系统 SHALL 实施accessToken + refreshToken双Token策略。

#### Scenario: Token结构
- **WHEN** 后端签发Token
- **THEN** accessToken有效期7天，refreshToken有效期30天，Token载荷包含userId、openid、role、has_profile

#### Scenario: Token自动续期
- **WHEN** 用户发起API请求且accessToken即将过期（距过期时间小于1天）
- **THEN** 系统自动使用refreshToken换取新accessToken，用户无感知

#### Scenario: refreshToken也过期
- **WHEN** 用户的accessToken和refreshToken都已过期
- **THEN** 系统尝试静默登录（wx.login换新code），若静默登录也失败则清除本地登录状态，引导手动操作

#### Scenario: 小程序每次打开刷新Token
- **WHEN** 用户重新打开小程序
- **THEN** 系统自动调用wx.login获取新code并换取新Token，确保Token始终有效

### Requirement: 角色管理
系统 SHALL 支持管理员和访客两种角色，不同角色拥有不同的权限。

#### Scenario: 新用户默认角色
- **WHEN** 新用户通过微信登录创建记录
- **THEN** 该用户角色默认为visitor（访客）

#### Scenario: 管理员角色识别
- **WHEN** 管理员的微信openid登录小程序
- **THEN** 后端根据openid识别管理员身份，Token中role=admin，小程序展示管理功能入口

#### Scenario: 管理员角色分配
- **WHEN** 管理员在Web后台将某用户角色从访客变更为管理员
- **THEN** 系统更新该用户角色，该用户下次Token刷新时获取admin角色

#### Scenario: 至少保留一个管理员
- **WHEN** 管理员尝试将最后一个管理员降级为访客
- **THEN** 系统拒绝操作并提示"系统必须至少保留一个管理员"

### Requirement: 权限控制
系统 SHALL 根据用户角色和登录状态实施前端和后端双重权限控制。

#### Scenario: 前端权限控制-管理员功能展示
- **WHEN** 管理员登录小程序（Token中role=admin）
- **THEN** 系统展示"发布作品"、"管理"等管理员专属入口和按钮

#### Scenario: 前端权限控制-访客功能限制
- **WHEN** 访客登录小程序（Token中role=visitor）
- **THEN** 系统隐藏所有管理相关入口，仅展示浏览和互动功能

#### Scenario: 后端权限校验-管理员接口
- **WHEN** 前端请求需要管理员权限的接口（如创建作品、删除评论等）
- **THEN** 后端校验请求Token中的role字段，若非admin则返回403禁止访问

#### Scenario: 后端权限校验-用户资源权限
- **WHEN** 用户尝试修改或删除非自己创建的资源（如评论）
- **THEN** 后端校验资源归属，非本人且非管理员则返回403禁止访问

#### Scenario: 互动操作需登录
- **WHEN** 未登录或Token失效的用户尝试执行点赞/评论/我想要操作
- **THEN** 后端返回401，前端触发静默登录后重试操作

### Requirement: 管理后台登录
系统 SHALL 提供Web管理后台的账号密码登录方式，与小程序微信登录体系独立。

#### Scenario: 管理后台登录页面
- **WHEN** 用户访问Web管理后台
- **THEN** 系统展示登录页面，包含账号输入框、密码输入框和登录按钮

#### Scenario: 输入账号密码登录
- **WHEN** 用户输入正确的管理员账号和密码并点击登录
- **THEN** 系统验证账号密码，成功后签发管理后台JWT Token（有效期24小时），跳转到数据概览页面

#### Scenario: 登录失败提示
- **WHEN** 用户输入错误的账号或密码
- **THEN** 系统提示"账号或密码错误"，连续5次失败后锁定账号15分钟

#### Scenario: 账号锁定
- **WHEN** 同一账号连续5次登录失败
- **THEN** 系统锁定该账号15分钟，锁定期间拒绝登录并提示"账号已锁定，请15分钟后重试"

#### Scenario: 管理后台Token过期
- **WHEN** 管理员JWT Token过期
- **THEN** 自动跳转到登录页，提示"登录已过期，请重新登录"

#### Scenario: 管理后台退出登录
- **WHEN** 管理员点击退出登录
- **THEN** 系统清除本地Token和会话信息，跳转到登录页面

#### Scenario: 管理后台初始管理员账号
- **WHEN** 系统首次部署
- **THEN** 系统创建默认管理员账号（admin），管理员首次登录后MUST修改初始密码

### Requirement: 密码安全管理
系统 SHALL 对管理后台的密码实施安全管理策略。

#### Scenario: 密码强度校验
- **WHEN** 管理员设置或修改密码
- **THEN** 系统校验密码强度：至少8位，包含大小写字母和数字，不满足时提示具体要求

#### Scenario: 密码加密存储
- **WHEN** 管理员密码保存到数据库
- **THEN** 系统使用bcrypt算法加密存储，禁止明文存储

#### Scenario: 修改密码
- **WHEN** 管理员在设置页面修改密码
- **THEN** 系统要求输入旧密码验证身份，验证通过后设置新密码
