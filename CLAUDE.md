# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Handcraft Showcase Platform (手作展示平台) — a platform for handcraft hobbyists to showcase and share their work. Three-tier architecture: WeChat Mini Program (native), Web Admin (React), and API Server (NestJS). Phase 1 focuses on showcase & interaction only, no transactions/payments. Single admin (the craft author); visitors browse and interact via WeChat.

## Commands

### Server (server/)
```bash
npm run start:dev    # Dev mode with hot reload
npm run build        # Compile
npm run test         # Unit tests (Jest)
npm run test:cov     # Tests with coverage (thresholds: 80% lines/functions, 70% branches)
npm run test:e2e     # E2E tests
npm run lint         # ESLint
npm run format       # Prettier
```

### Web Admin (web-admin/)
```bash
npm run dev              # Dev server with HMR (port 5173)
npm run build            # Production build
npm run test             # Vitest
npm run test:coverage    # Coverage with V8 provider
npm run lint             # ESLint
npm run generate-api-types  # Generate TypeScript types from Swagger OpenAPI JSON
```

### Infrastructure
```bash
docker compose -f deploy/docker-compose.dev.yml --env-file .env.dev up -d   # Start PostgreSQL + Redis + MinIO
docker compose -f deploy/docker-compose.dev.yml down                         # Stop (data preserved)
docker compose -f deploy/docker-compose.dev.yml down -v                      # Stop and clear data
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

## Environment

Env files loaded from project root: `.env.{NODE_ENV}` (falls back to `.env.example`). Copy `deploy/.env.example` to `.env.dev` to start. Required overrides: `WX_APPID`, `WX_SECRET`, `JWT_SECRET`.
