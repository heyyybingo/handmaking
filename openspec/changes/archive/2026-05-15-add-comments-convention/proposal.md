## Why

代码库当前缺乏统一的注释规约，现有代码中注释覆盖率低且风格不一致。随着项目进入正式开发阶段，需要在所有功能模块中添加合适的注释，并将注释规约纳入项目约束（CLAUDE.md），确保后续开发保持一致性和可维护性。

## What Changes

- 为所有业务模块（controller、service、dto、entity）的关键代码添加注释，包括类说明、公共方法说明、复杂逻辑说明
- 为公共基础设施（filters、interceptors、guards、decorators、storage providers）添加注释
- 为 web-admin 前端关键组件、工具函数、hooks 添加注释
- 制定注释规约并写入 CLAUDE.md，作为项目级别的编码约束
- 注释使用中文（与项目沟通语言保持一致）

## Capabilities

### New Capabilities

- `comment-convention`: 统一的注释规约——定义注释格式、位置、内容要求，覆盖 NestJS 后端和 React 前端的注释规范

### Modified Capabilities

<!-- 无现有 capability 的需求变更，此为新增约束 -->

## Impact

- 所有 `server/src/modules/` 下的业务模块文件（controller、service、dto）
- 所有 `server/src/common/` 下的公共基础设施文件（filters、interceptors、guards、decorators）
- 所有 `server/src/storage/` 下的存储相关文件
- 所有 `server/src/entities/` 下的实体定义文件
- `web-admin/src/` 下的组件、工具函数、hooks 文件
- `CLAUDE.md` 项目约束文件（新增注释规约章节）