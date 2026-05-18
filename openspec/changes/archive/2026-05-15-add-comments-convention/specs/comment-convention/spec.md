## ADDED Requirements

### Requirement: 类/模块注释
每个业务模块的 controller、service、实体类、DTO 类以及公共基础设施类（filters、interceptors、guards、decorators）SHALL 在类声明上方包含注释，说明该类的职责和主要功能。

#### Scenario: Controller 类注释
- **WHEN** 创建或修改一个 controller 类
- **THEN** 类声明上方必须包含注释，说明该 controller 处理的资源、路由前缀和核心功能

#### Scenario: Service 类注释
- **WHEN** 创建或修改一个 service 类
- **THEN** 类声明上方必须包含注释，说明该 service 负责的业务逻辑范围

#### Scenario: Entity/DTO 类注释
- **WHEN** 创建或修改一个 entity 或 DTO 类
- **THEN** 类声明上方必须包含注释，说明该类的用途和对应的数据表或请求/响应场景

### Requirement: 公共方法注释
所有 public 方法（含 async 方法）SHALL 在方法声明上方包含注释，说明方法用途、参数含义和返回值。简单的 getter/setter 和生命周期钩子（如 ngOnInit、constructor）除外。

#### Scenario: 带参数和返回值的方法注释
- **WHEN** 定义一个包含参数和返回值的 public 方法
- **THEN** 方法上方必须包含注释，说明方法用途、关键参数含义和返回值描述

#### Scenario: 简单 getter/setter 豁免
- **WHEN** 定义标准的 getter 或 setter 方法，如 `getStatus()` 或 `setStatus(status: string)`
- **THEN** 不需要添加注释

### Requirement: 关键逻辑注释
代码中的复杂算法、非显而易见的业务规则、边界条件处理、临时解决方案（workaround）SHALL 添加行内注释说明原因。

#### Scenario: 复杂业务逻辑
- **WHEN** 实现包含多个条件分支或计算步骤的业务逻辑
- **THEN** 关键步骤上方应添加注释说明该步骤的目的

#### Scenario: 非显而易见的边界处理
- **WHEN** 代码包含处理特殊情况（null、空数组、超时等）的逻辑
- **THEN** 应添加注释说明为何需要此处理

### Requirement: 公共基础设施注释
所有 filters、interceptors、guards、decorators、storage providers 等公共组件 SHALL 包含注释说明其用途、使用场景和使用方式。

#### Scenario: Guard 注释
- **WHEN** 定义一个新的 guard
- **THEN** 类注释应说明该 guard 的校验规则、适用场景和使用示例

#### Scenario: Interceptor 注释
- **WHEN** 定义一个新的 interceptor
- **THEN** 类注释应说明该 interceptor 拦截的时机、处理内容和副作用

### Requirement: 前端组件注释
React 组件和自定义 hooks SHALL 包含注释说明其用途和关键 props/参数。

#### Scenario: 页面组件
- **WHEN** 定义一个新的页面级组件
- **THEN** 组件声明上方应包含注释，说明该页面对应的业务场景

#### Scenario: 自定义 Hook
- **WHEN** 定义一个自定义 hook
- **THEN** hook 声明上方应包含注释，说明其封装的功能和返回值

### Requirement: 注释语言
所有注释 SHALL 使用简体中文编写。

#### Scenario: 中文注释
- **WHEN** 编写任何代码注释
- **THEN** 注释内容必须使用简体中文

### Requirement: CLAUDE.md 注释规约
CLAUDE.md 中 MUST 包含"注释规约"章节，作为项目级编码约束，定义注释格式、层级和语言要求。

#### Scenario: 注释规约可被 AI 和开发者查阅
- **WHEN** AI 或开发者查阅 CLAUDE.md
- **THEN** 应能看到完整的注释规约章节，包含注释语言、层级体系、格式要求和适用范围