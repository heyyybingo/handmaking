# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Handcraft Showcase Platform (手作展示平台) — a platform for handcraft hobbyists to showcase and share their work. Three-tier architecture: WeChat Mini Program (native), Web Admin (React), and API Server (NestJS). Phase 1 focuses on showcase & interaction only, no transactions/payments. Single admin (the craft author); visitors browse and interact via WeChat.

## Communication

与用户沟通时始终使用中文。

## Commands

This is an npm workspaces monorepo. Run all commands from the project root.

```bash
# Install all dependencies (server + web-admin)
npm install

# Development — start server + web-admin in parallel
npm run dev              # Both services concurrently
npm run dev:server       # Server only (port 3000)
npm run dev:web          # Web admin only (port 5173)

# Testing
npm run test             # All tests (server + web-admin)
npm run test:server      # Server unit tests (Jest)
npm run test:web         # Web admin tests (Vitest)
npm run test:cov         # Server coverage (thresholds: 80% lines/functions, 70% branches)

# Lint & Format
npm run lint             # ESLint (server + web-admin)
npm run format           # Prettier (server)

# Build
npm run build            # Production build (server + web-admin)

# Individual package commands
npm -w server run <cmd>  # Run any script in server package
npm -w web-admin run <cmd>  # Run any script in web-admin package
```

### Infrastructure
```bash
npm run docker:up        # Start PostgreSQL + Redis + MinIO
npm run docker:down      # Stop (data preserved)
# To clear all data: docker compose -f deploy/docker-compose.dev.yml down -v
```

## Architecture

### Server (NestJS)
- **Entry**: `server/src/main.ts` — global prefix `api/`, ValidationPipe (whitelist + forbidNonWhitelisted), Swagger at `api/docs`, CORS enabled
- **Root module**: `server/src/app.module.ts` — ConfigModule (global, loads `.env.{NODE_ENV}`), TypeORM (PostgreSQL, autoLoadEntities, synchronize in dev), RedisModule, StorageModule, then 7 business modules
- **Path alias**: `@/*` → `src/*`
- **Business modules** (each in `server/src/modules/`): craft-showcase, content-management, social-interaction, i-want-feature, ai-assistant, user-auth, admin-dashboard. Currently scaffolded (module files only, no controllers/services yet)
- **Common** (`server/src/common/`): redis (global module with ioredis wrapper), guards, filters, interceptors, decorators (all empty, to be populated)
- **Storage** (`server/src/storage/`): `IStorageService` interface with provider pattern. Switches between MinIO (dev) and OSS (prod) via `STORAGE_PROVIDER` env var. Includes `ImageProcessorService` (Sharp) for thumbnail generation (200x200, 400x400 + WebP conversion)
- **Jest config**: rootDir=src, test pattern `*.spec.ts`, module alias `@/*` → `<rootDir>/$1`. Coverage excludes modules/entities/index/main

### Web Admin (React + Vite)
- **Path alias**: `@/*` → `src/*`
- **Vite proxy**: `/api` → `http://localhost:3000` (dev only)
- **Theme**: "Warm Craftsmanship" (温暖匠心) — primary `#C4956A`, Ant Design theme config in `src/styles/theme.ts`, color constants in `COLORS` object
- **HTTP client**: Axios wrapper in `src/utils/request.ts` — auto JWT bearer token, 401→login redirect, 403 handling
- **Mock**: MSW (Mock Service Worker) in `src/mocks/` — add handlers per module for parallel frontend development
- **Testing**: Vitest with jsdom, setup in `src/test/setup.ts`

### API Design Conventions
- Admin endpoints: `/api/admin/*` (JWT + admin role)
- Mini Program endpoints: `/api/mini/*` (WeChat openid auth)
- Pagination: cursor-based (for infinite scroll)
- File upload: client-side presigned URL direct upload
- AI responses: Server-Sent Events (streaming)
- Error format: `{ code: string, message: string, details?: any }`

### Key Design Decisions
- WeChat login: silent login (auto wx.login for openid) + on-demand profile completion via half-screen panel when user first interacts (likes/comments/intent)
- Storage abstraction: `IStorageService` interface lets business code stay provider-agnostic; switching dev↔prod only requires env var change
- Image processing: Sharp for thumbnails (always server-side), not relying on OSS image processing service
- Video covers: manual upload in dev (no ffmpeg dependency); auto-extraction possible in prod
- Counters (likes/comments/intents): Redis counters + periodic DB write-back (eventual consistency)

## Design System

"Warm Craftsmanship" visual style:
- **Primary**: `#C4956A` (warm copper) — main buttons, tab highlights, key info
- **Secondary**: `#8B6F4E` (dark wood), `#E8D5C0` (light camel), `#7BA98F` (celadon green)
- **Neutrals**: `#2D2D2D` (heading), `#666666` (body), `#999999` (secondary), `#E5E5E5` (divider), `#F5F5F5` (bg)
- **Semantic**: `#52C41A` (success), `#FAAD14` (warning), `#FF4D4F` (error)
- **Core principle**: Minimal interaction — complete core operations within 3 steps

## Development Workflow

API-first approach for all frontend-backend modules:
1. Define API contract (NestJS Swagger decorators) → generate OpenAPI docs
2. Frontend (MSW mocks) and backend (service + unit tests) develop in parallel
3. Integration — switch frontend to real API, verify end-to-end

When adding a new business module to the server, register it in `app.module.ts` imports. When adding API types to web-admin, run `npm run generate-api-types` after the server is running.

## 注释规约

所有代码注释使用**简体中文**，采用三级注释体系：

### 注释层级

1. **类/模块注释**：每个 controller、service、entity、DTO、公共基础设施类（filters、interceptors、guards、decorators）在类声明上方使用 JSDoc 风格注释说明职责和主要功能
2. **公共方法注释**：所有 public 方法（含 async）在方法声明上方使用 JSDoc 风格注释说明用途、关键参数含义和返回值。简单的 getter/setter 和生命周期钩子（ngOnInit、constructor）除外
3. **关键逻辑注释**：复杂算法、非显而易见的业务规则、边界条件处理、临时解决方案（workaround）使用行内注释（`//`）说明原因

### 格式要求

- 后端（NestJS）：JSDoc 风格块注释 `/** ... */`
- 前端（React）：JSDoc 风格或单行注释 `//`
- 注释内容简洁明了，说明"为什么"而非"做什么"（代码本身说明"做什么"）

### 适用范围

- 所有 `server/src/modules/` 下的 controller、service、dto 文件
- 所有 `server/src/common/` 下的公共基础设施文件
- 所有 `server/src/storage/` 下的存储相关文件
- 所有 `server/src/entities/` 下的实体定义文件
- `web-admin/src/` 下的组件、hooks、工具函数文件

## Environment

Env files loaded from project root: `.env.{NODE_ENV}` (falls back to `.env.example`). Copy `deploy/.env.example` to `.env.dev` to start. Required overrides: `WX_APPID`, `WX_SECRET`, `JWT_SECRET`.
