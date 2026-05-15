# 生产环境配置指南

生产环境是面向真实用户的正式环境，安全性和稳定性为最高优先级。

## 与预发布环境的差异

| 维度 | 预发布环境 (staging) | 生产环境 (prod) |
|------|---------------------|----------------|
| 数据库 | Docker 容器 / 云 RDS | 云 RDS（主从+只读副本） |
| Redis | Docker 容器 / 云 Redis | 云 Redis（集群模式） |
| 文件存储 | MinIO / OSS | 阿里云/腾讯云 OSS + CDN |
| HTTPS | Let's Encrypt / 自签名 | 正式 SSL 证书 |
| 域名 | staging 子域名 | 正式域名 |
| 日志 | 文件日志 | 文件 + 云日志服务 |
| 监控 | 基础健康检查 | 完整监控告警 |
| 备份 | 手动 | 自动定时备份 |

## 部署流程

### 1. 配置环境变量

```bash
cp deploy/.env.example .env.prod
# 编辑 .env.prod，所有配置项必须使用生产值
```

**必须修改的配置项：**

| 变量 | 说明 | 要求 |
|------|------|------|
| `NODE_ENV` | 设为 `production` | 必须 |
| `JWT_SECRET` | JWT 签名密钥 | 至少 32 位随机字符串 |
| `ADMIN_PASSWORD` | 管理员密码 | 强密码，含大小写+数字+特殊字符 |
| `WX_APPID` / `WX_SECRET` | 微信小程序 | 使用正式 AppID |
| `DATABASE_PASSWORD` | 数据库密码 | 强密码 |
| `REDIS_PASSWORD` | Redis 密码 | 强密码 |
| `OSS_ACCESS_KEY` / `OSS_SECRET_KEY` | OSS 访问密钥 | 使用 RAM 子账号密钥 |
| `CDN_DOMAIN` | CDN 域名 | 配置 HTTPS 证书 |
| `AI_API_KEY` | AI 服务密钥 | 生产密钥 |

### 2. 构建应用镜像

```bash
# 构建后端镜像
docker build -t handcraft-api:prod -f server/Dockerfile ./server

# 构建 Web 管理后台镜像
docker build -t handcraft-web:prod -f web-admin/Dockerfile ./web-admin
```

### 3. 启动全部服务

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file .env.prod up -d

# 查看服务状态
docker compose -f deploy/docker-compose.prod.yml ps

# 查看日志
docker compose -f deploy/docker-compose.prod.yml logs -f api-server
```

### 4. 数据库迁移

生产环境**严禁**使用 `synchronize: true`，必须通过迁移脚本执行：

```bash
# 在后端容器中执行迁移
docker compose -f deploy/docker-compose.prod.yml exec api-server npm run migration:run
```

迁移前务必备份数据库。

### 5. 验证部署

- API 健康检查：`https://<domain>/api/health`
- Swagger 文档：`https://<domain>/api/docs`（建议生产环境关闭或限制访问）
- Web 管理后台：`https://<domain>`
- 小程序端：微信开发者工具 → 真机调试

## 安全配置

### 网络安全

- 所有服务仅暴露必要端口（80/443），数据库和 Redis 不对外暴露
- Nginx 启用 HTTPS，强制 HTTP → HTTPS 跳转
- 配置 CSP (Content-Security-Policy) 头
- 启用 HSTS (Strict-Transport-Security)
- API 限流：按 IP 限流，防止暴力攻击

### 数据库安全

- 使用云 RDS，开启自动备份（每日全量 + 实时 WAL 日志）
- 启用 SSL 连接
- 使用最小权限账号（非 superuser）
- 定期检查慢查询日志
- 配置连接池，防止连接泄漏

### Redis 安全

- 使用云 Redis，开启密码认证
- 禁用危险命令（FLUSHALL、CONFIG 等）
- 设置最大内存策略为 `allkeys-lru`
- 开启持久化（AOF）

### 应用安全

- JWT Secret 使用强随机密钥，定期轮换
- 管理员密码强制定期修改
- 文件上传限制：类型白名单 + 大小限制
- Swagger 文档生产环境建议关闭或限制 IP 访问
- 环境变量文件权限设为 600

### OSS / CDN 安全

- OSS Bucket 设为私有读写，通过预签名 URL 访问
- CDN 配置回源鉴权
- 开启防盗链（Referer 白名单）
- 配置日志记录，审计访问行为

## 监控告警

### 基础设施监控

| 监控项 | 告警阈值 | 告警方式 |
|--------|---------|---------|
| API 服务可用性 | 连续 3 次健康检查失败 | 邮件 + 短信 |
| API 响应时间 P99 | > 3s | 邮件 |
| API 5xx 错误率 | > 1% | 邮件 + 短信 |
| PostgreSQL 连接数 | > 80% 最大连接数 | 邮件 |
| PostgreSQL 慢查询 | > 5s | 邮件 |
| Redis 内存使用 | > 80% 最大内存 | 邮件 |
| CPU 使用率 | > 80% 持续 5 分钟 | 邮件 |
| 内存使用率 | > 85% | 邮件 |
| 磁盘使用率 | > 80% | 邮件 |

### 业务监控

| 监控项 | 说明 |
|--------|------|
| 日活用户数 | 微信小程序日活统计 |
| API 请求量 | 按接口维度统计 |
| 文件上传量 | 存储空间使用趋势 |
| 点赞/评论数 | 互动数据趋势 |

### 推荐监控工具

- 云厂商内置监控（阿里云 CloudMonitor / 腾讯云 Monitor）
- 日志服务（阿里云 SLS / 腾讯云 CLS）
- 自建可选：Prometheus + Grafana

## 备份与恢复

### 数据库备份

| 备份类型 | 频率 | 保留时长 |
|---------|------|---------|
| 全量备份 | 每日 | 30 天 |
| WAL 日志 | 实时 | 7 天 |
| 手动快照 | 版本发布前 | 永久 |

### 恢复流程

```bash
# 1. 从云 RDS 控制台选择备份点进行恢复
# 2. 或使用 pg_restore 手动恢复
pg_restore -h <host> -U <user> -d handcraft <backup-file>

# 3. 验证数据完整性后重启应用
docker compose -f deploy/docker-compose.prod.yml restart api-server
```

### 文件存储备份

- OSS 开启跨区域复制（可选）
- OSS 开启版本控制，防止误删
- CDN 缓存刷新：`https://cdn.domain.com/purge`

## 回滚

```bash
# 1. 回滚到上一版本镜像
docker compose -f deploy/docker-compose.prod.yml down
# 2. 使用上一版本镜像启动
docker compose -f deploy/docker-compose.prod.yml up -d

# 或指定镜像版本
docker tag handcraft-api:previous handcraft-api:prod
docker compose -f deploy/docker-compose.prod.yml up -d
```

**数据库回滚注意**：数据库迁移不可自动回滚，需手动编写回滚迁移脚本。
