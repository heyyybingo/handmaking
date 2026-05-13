# 手作展示平台

手作爱好者的专属作品展示与分享平台。通过微信小程序展示精美手工作品，结合 Web 管理后台实现高效内容管理和 AI 辅助运营。

## 项目结构

```
handmaking/
├── server/              # NestJS 后端服务
│   └── src/
│       ├── common/      # 公共模块（Redis、Guards、Filters等）
│       ├── modules/     # 业务模块
│       │   ├── craft-showcase/       # 作品展示
│       │   ├── content-management/   # 内容管理
│       │   ├── social-interaction/   # 社交互动
│       │   ├── i-want-feature/       # "我想要"
│       │   ├── ai-assistant/         # AI辅助
│       │   ├── user-auth/            # 用户认证
│       │   └── admin-dashboard/      # 管理后台
│       └── storage/     # 文件存储（MinIO/OSS抽象层）
├── web-admin/           # React Web 管理后台
│   └── src/
│       ├── components/  # 通用组件
│       ├── pages/       # 页面
│       ├── services/    # API 服务
│       ├── mocks/       # MSW Mock 数据
│       ├── styles/      # 主题样式
│       └── utils/       # 工具函数
├── mini-app/            # 微信小程序（待创建）
├── deploy/              # 部署配置
│   ├── docker-compose.dev.yml
│   └── .env.example
└── docs/                # 项目文档
    └── development.md
```

## 技术栈

| 端 | 框架 | 核心技术 |
|----|------|---------|
| 后端 | NestJS | TypeORM + PostgreSQL + Redis + MinIO/OSS |
| Web 管理后台 | React + Vite | Ant Design + ProComponents + MSW |
| 小程序 | 微信原生 | 原生组件 + 自定义组件 |

## 快速启动

详细步骤请参考 [开发环境配置指南](docs/development.md)。

```bash
# 1. 配置环境变量
cp deploy/.env.example .env.dev

# 2. 启动基础设施（PostgreSQL + Redis + MinIO）
docker compose -f deploy/docker-compose.dev.yml --env-file .env.dev up -d

# 3. 启动后端服务
cd server && npm install && npm run start:dev

# 4. 启动 Web 管理后台
cd web-admin && npm install && npm run dev
```

- 后端 API：http://localhost:3000
- Swagger 文档：http://localhost:3000/api/docs
- Web 管理后台：http://localhost:5173
- MinIO 控制台：http://localhost:9001

## 设计风格

"温暖匠心"视觉风格：

- **主色**：#C4956A（暖铜色）—— 代表匠心打磨的温暖质感
- **辅助色**：#8B6F4E（深木色）、#E8D5C0（浅驼色）、#7BA98F（青瓷绿）
- **核心原则**：交互极简，3步内完成核心操作

## 开发规范

- **接口先行**：先定义 API 契约（Swagger），再前后端并行开发
- **单元测试**：Service 层核心逻辑覆盖率 80%+
- **Mock 并行**：Web 端使用 MSW、小程序端内置 Mock 模式
- **注释规范**：每个组件/方法必须写明 JSDoc 注释，状态需描述类型和意义
