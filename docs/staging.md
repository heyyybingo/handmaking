# 预发布环境配置指南

预发布（staging）环境用于上线前的最终验证，配置尽量贴近生产环境。

## 与开发环境的差异

| 维度 | 开发环境 (dev) | 预发布环境 (staging) |
|------|---------------|---------------------|
| API Server | 本地运行 (nest start --watch) | Docker 容器 |
| Web Admin | 本地运行 (npm run dev) | Docker 容器 + Nginx |
| PostgreSQL | Docker 容器 | Docker 容器 / 云 RDS |
| Redis | Docker 容器 | Docker 容器 / 云 Redis |
| 文件存储 | MinIO (Docker) | MinIO (Docker) 或 OSS |
| HTTPS | 不需要 | 需要 |
| 数据初始化 | auto synchronize + 种子数据 | 迁移脚本 |
| 日志 | 控制台输出 | 文件日志 |

## 部署流程

### 1. 配置环境变量

```bash
cp deploy/.env.example .env.staging
# 编辑 .env.staging，必须修改：
#   NODE_ENV=staging
#   JWT_SECRET=<强密钥>
#   ADMIN_PASSWORD=<强密码>
#   WX_APPID / WX_SECRET — 使用测试号或真实 AppID
#   AI_API_KEY — 如需测试 AI 功能
```

### 2. 构建应用镜像

```bash
# 构建后端镜像
docker build -t handcraft-api:staging ./server

# 构建 Web 管理后台镜像
docker build -t handcraft-web:staging ./web-admin
```

### 3. 启动全部服务

```bash
docker compose -f deploy/docker-compose.staging.yml --env-file .env.staging up -d

# 查看服务状态
docker compose -f deploy/docker-compose.staging.yml ps

# 查看日志
docker compose -f deploy/docker-compose.staging.yml logs -f api-server
```

### 4. 数据库迁移

预发布环境不使用 `synchronize: true`，需要手动执行迁移：

```bash
# 进入后端容器执行迁移
docker compose -f deploy/docker-compose.staging.yml exec api-server npm run migration:run
```

### 5. 验证部署

- API 服务：`https://<staging-domain>/api`
- Swagger 文档：`https://<staging-domain>/api/docs`
- Web 管理后台：`https://<staging-domain>`
- 健康检查：`https://<staging-domain>/api/health`

## 服务端口与域名

预发布环境通过 Nginx 反向代理统一入口：

| 服务 | 内部端口 | Nginx 代理路径 |
|------|---------|---------------|
| API Server | 3000 | /api |
| Web Admin | 80 (Nginx) | / |
| PostgreSQL | 5432 | 仅内部访问 |
| Redis | 6379 | 仅内部访问 |
| MinIO API | 9000 | 仅内部访问 |
| MinIO Console | 9001 | 仅内部访问 |

## HTTPS 配置

使用 Let's Encrypt 或自签名证书：

```nginx
# Nginx SSL 配置示例
server {
    listen 443 ssl http2;
    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
}
```

## 日志管理

- API Server：输出到 `/var/log/handcraft/api.log`，按天轮转
- Nginx：`/var/log/nginx/access.log` 和 `error.log`
- 查看：`docker compose logs -f <service-name>`

## 回滚

```bash
# 回滚到上一个版本
docker compose -f deploy/docker-compose.staging.yml down
docker tag handcraft-api:staging handcraft-api:rollback
docker compose -f deploy/docker-compose.staging.yml up -d
```
