# 开发环境配置指南

本文档介绍如何在本地搭建手作展示平台的开发环境。

## 前置依赖

| 工具 | 最低版本 | 说明 |
|------|---------|------|
| Node.js | 20.x | 运行时环境 |
| npm | 10.x | 包管理器 |
| Docker | 24.x | 运行基础设施服务 |
| Docker Compose | 2.x | 编排容器服务 |
| 微信开发者工具 | 最新 | 小程序开发调试 |

## 快速启动

### 1. 克隆项目

```bash
git clone <repository-url>
cd handmaking
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp deploy/.env.example .env.dev

# 编辑 .env.dev 填入开发配置（大部分默认值可直接使用）
# 必须修改的配置项：
#   WX_APPID - 微信小程序 AppID
#   WX_SECRET - 微信小程序 Secret
#   JWT_SECRET - JWT 签名密钥（生产环境务必修改）
```

### 3. 启动基础设施服务

```bash
# 启动 PostgreSQL + Redis + MinIO
docker compose -f deploy/docker-compose.dev.yml --env-file .env.dev up -d

# 查看服务状态（等待所有服务 healthy）
docker compose -f deploy/docker-compose.dev.yml ps

# 停止服务（数据保留）
docker compose -f deploy/docker-compose.dev.yml down

# 停止服务并清除数据
docker compose -f deploy/docker-compose.dev.yml down -v
```

### 4. 启动后端服务

```bash
cd server
npm install
npm run start:dev
```

后端服务启动后访问：
- API 服务：http://localhost:3000
- Swagger 文档：http://localhost:3000/api/docs

### 5. 启动 Web 管理后台

```bash
cd web-admin
npm install
npm run dev
```

Web 管理后台访问：http://localhost:5173

### 6. 打开小程序项目

使用微信开发者工具打开 `mini-app` 目录（小程序项目待创建）。

## 基础设施服务说明

### PostgreSQL

| 配置项 | 默认值 |
|--------|--------|
| 端口 | 5432 |
| 数据库名 | handcraft |
| 用户名 | handcraft |
| 密码 | handcraft-dev |

开发模式下 TypeORM 开启 `synchronize: true`，实体变更会自动同步到数据库。

### Redis

| 配置项 | 默认值 |
|--------|--------|
| 端口 | 6379 |
| 密码 | handcraft-dev-redis |

用于：缓存、点赞计数、会话管理、接口限流。

### MinIO

| 配置项 | 默认值 |
|--------|--------|
| API 端口 | 9000 |
| 控制台端口 | 9001 |
| Access Key | handcraft-dev |
| Secret Key | handcraft-dev-secret |
| Bucket | handcraft |

MinIO 控制台：http://localhost:9001

开发阶段使用 MinIO 模拟 S3 存储，生产阶段切换为阿里云/腾讯云 OSS。

## 环境变量说明

所有环境变量定义在 `deploy/.env.example` 中，主要分类：

| 类别 | 变量前缀 | 说明 |
|------|---------|------|
| 应用 | `NODE_ENV`, `APP_PORT` | 运行环境和端口 |
| 数据库 | `DATABASE_*` | PostgreSQL 连接配置 |
| Redis | `REDIS_*` | Redis 连接配置 |
| 存储 | `STORAGE_PROVIDER`, `MINIO_*`, `OSS_*` | 文件存储服务配置 |
| 微信 | `WX_APPID`, `WX_SECRET` | 微信小程序登录配置 |
| AI | `AI_MODEL`, `AI_API_KEY`, `AI_BASE_URL` | AI 服务配置 |
| JWT | `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN` | Token 配置 |

## 常用命令

### 后端（server/）

```bash
npm run start:dev     # 开发模式启动（热重载）
npm run build         # 编译
npm run test          # 运行单元测试
npm run test:cov      # 运行测试并生成覆盖率报告
npm run test:e2e      # 运行端到端测试
npm run lint          # ESLint 检查
npm run format        # Prettier 格式化
```

### Web 管理后台（web-admin/）

```bash
npm run dev           # 开发模式启动（HMR）
npm run build         # 构建生产版本
npm run test          # 运行测试
npm run test:coverage # 运行测试并生成覆盖率报告
npm run lint          # ESLint 检查
```

## 常见问题排查

### Docker 容器启动失败

1. 检查 Docker 是否运行：`docker ps`
2. 检查端口占用：`netstat -an | findstr 5432`（PostgreSQL）、`netstat -an | findstr 6379`（Redis）
3. 查看容器日志：`docker compose -f deploy/docker-compose.dev.yml logs <service-name>`

### 数据库连接失败

1. 确认 PostgreSQL 容器已启动且 healthy：`docker compose -f deploy/docker-compose.dev.yml ps`
2. 检查 `.env.dev` 中数据库配置是否与 docker-compose 一致
3. 等待 healthcheck 通过后再启动后端服务

### MinIO 文件上传失败

1. 确认 MinIO 容器已启动：访问 http://localhost:9001
2. 确认 `handcraft` bucket 已创建（minio-init 容器自动创建）
3. 检查 `.env.dev` 中 MinIO 配置是否正确

### npm install 失败

1. 清除缓存：`npm cache clean --force`
2. 删除 `node_modules` 和 `package-lock.json` 后重新安装
3. 检查网络代理设置
