## 1. CLAUDE.md 注释规约

- [x] 1.1 在 CLAUDE.md 中新增"注释规约"章节，定义注释语言（中文）、三级注释体系（类/模块、公共方法、关键逻辑）、JSDoc 格式要求及适用范围

## 2. Server 实体注释

- [x] 2.1 为 `server/src/entities/` 下所有实体类添加类注释，说明各实体对应的业务概念和数据表用途
- [x] 2.2 为实体中非自解释的关键字段（如状态枚举、关联关系）添加行内注释

## 3. Server 公共基础设施注释

- [x] 3.1 为 `server/src/common/redis/` 下的 redis.module.ts 和 redis.service.ts 添加类和公共方法注释
- [x] 3.2 为 `server/src/common/filters/all-exceptions.filter.ts` 添加类注释，说明全局异常过滤器的处理策略
- [x] 3.3 为 `server/src/common/interceptors/` 下所有 interceptor（logging、cache、rate-limit）添加类注释，说明拦截时机和用途

## 4. Server 存储模块注释

- [x] 4.1 为 `server/src/storage/storage.interface.ts` 的接口和每个方法签名添加注释
- [x] 4.2 为 `server/src/storage/image-processor.service.ts` 添加类和公共方法注释
- [x] 4.3 为 `server/src/storage/storage.module.ts` 添加类注释

## 5. Server 业务模块注释（Controller & Service）

- [x] 5.1 为 craft-showcase 模块的 controller、service 添加类和公共方法注释
- [x] 5.2 为 content-management 模块的 controller、service 添加类和公共方法注释
- [x] 5.3 为 social-interaction 模块的 controller、service 添加类和公共方法注释
- [x] 5.4 为 i-want-feature 模块的 controller、service 添加类和公共方法注释
- [x] 5.5 为 ai-assistant 模块的 controller、service 添加类和公共方法注释
- [x] 5.6 为 user-auth 模块的 controller、service、guard、strategy、decorator 添加类和公共方法注释
- [x] 5.7 为 admin-dashboard 模块的 controller、service 添加类和公共方法注释

## 6. Server DTO 注释

- [x] 6.1 为所有业务模块的 DTO 类添加类注释，说明各 DTO 的使用场景（请求/响应）
- [x] 6.2 为 DTO 中带有验证装饰器的关键字段添加说明注释

## 7. Web-Admin 前端注释（如适用）

- [x] 7.1 检查 web-admin/src/ 下是否有需要注释的组件和工具文件，若有则为关键组件和 hooks 添加注释（无 TS 文件，跳过）

## 8. 验证与收尾

- [x] 8.1 运行 `npm run lint` 确保注释添加未引入 lint 错误（现存问题均为预先存在的 any 类型警告等，注释未引入新错误）
- [x] 8.2 运行 `npm run test` 确保所有测试通过，注释变更未破坏任何功能（189 passed, 1 pre-existing failure）