## ADDED Requirements

### Requirement: AI生成作品描述
系统 SHALL 允许管理员使用AI根据作品图片和标签自动生成作品描述文案。

#### Scenario: 触发AI生成描述
- **WHEN** 管理员在作品编辑页点击描述字段旁的"AI生成描述"按钮
- **THEN** 系统调用AI接口，将作品图片和已有标签作为输入，流式返回生成结果

#### Scenario: 接受AI生成的描述
- **WHEN** AI生成结果展示后，管理员点击"使用此描述"
- **THEN** 生成内容填入描述字段，管理员可继续编辑修改

#### Scenario: 拒绝AI生成的描述
- **WHEN** 管理员对AI生成结果不满意
- **THEN** 可点击"重新生成"再次调用AI，或手动编辑描述字段

#### Scenario: AI功能未启用
- **WHEN** AI描述生成功能在配置中被关闭
- **THEN** "AI生成描述"按钮不显示或为禁用状态

### Requirement: AI标签建议
系统 SHALL 允许管理员使用AI根据作品图片和描述自动推荐标签。

#### Scenario: 触发AI标签建议
- **WHEN** 管理员点击标签字段旁的"AI推荐标签"按钮
- **THEN** 系统调用AI接口，返回3-5个推荐标签，以可点击的标签形式展示

#### Scenario: 选择AI推荐标签
- **WHEN** AI推荐标签展示后，管理员点击某个推荐标签
- **THEN** 该标签添加到作品的标签列表中

#### Scenario: 忽略AI推荐标签
- **WHEN** 管理员不点击任何推荐标签
- **THEN** 推荐标签在下次编辑时消失，不影响已有标签

### Requirement: AI图片优化建议
系统 SHALL 允许管理员使用AI获取上传图片的优化建议。

#### Scenario: 获取图片优化建议
- **WHEN** 管理员点击某张图片的"AI优化建议"按钮
- **THEN** 系统调用AI接口分析图片，返回建议（如"建议裁剪多余背景"、"光线偏暗建议调整亮度"等）

#### Scenario: 无优化建议
- **WHEN** AI分析后认为图片质量良好
- **THEN** 返回"图片质量不错，无需优化"提示

### Requirement: AI Prompt配置
系统 SHALL 允许管理员自定义各AI功能的Prompt模板和参数。

#### Scenario: 编辑描述生成Prompt
- **WHEN** 管理员在AI配置页修改"描述生成"的Prompt模板
- **THEN** 后续AI生成描述使用新的Prompt模板

#### Scenario: 调整AI参数
- **WHEN** 管理员调整AI的温度（temperature）参数
- **THEN** 后续AI调用使用新的参数值，影响生成结果的创造性

#### Scenario: 选择AI模型
- **WHEN** 管理员在配置页选择不同的AI模型
- **THEN** 后续AI调用使用选定的模型

### Requirement: AI功能开关
系统 SHALL 允许管理员独立启用或禁用每个AI功能。

#### Scenario: 禁用AI功能
- **WHEN** 管理员在AI配置页关闭某项AI功能开关
- **THEN** 该功能在编辑页的入口隐藏或禁用，调用时不执行AI请求

#### Scenario: 启用AI功能
- **WHEN** 管理员打开某项AI功能开关
- **THEN** 该功能在编辑页显示入口按钮，可正常调用

### Requirement: AI流式响应
系统 SHALL 使用Server-Sent Events实现AI生成内容的流式展示。

#### Scenario: 流式展示生成结果
- **WHEN** AI接口被调用
- **THEN** 生成内容逐字/逐句流式展示在界面上，用户可实时预览

#### Scenario: AI调用失败
- **WHEN** AI接口调用超时或返回错误
- **THEN** 系统提示"AI生成失败，请稍后重试"，不影响用户手动编辑
