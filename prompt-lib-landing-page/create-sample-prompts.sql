-- 创建示例提示词数据

-- 创建几个示例提示词
INSERT INTO prompts (title, description, content, is_public, created_at) VALUES
(
  '代码审查助手',
  '帮助进行全面的代码审查，检查代码质量、性能和安全性问题。',
  '请审查以下代码，重点关注：
1. 代码质量和可读性
2. 性能优化机会
3. 潜在的安全漏洞
4. 最佳实践遵循情况
5. 测试覆盖率建议',
  true,
  now()
),
(
  'API文档生成器',
  '自动生成清晰的API文档，包括请求参数、响应格式和示例代码。',
  '为以下API生成详细的文档：
1. 接口描述和用途
2. 请求参数说明（类型、必需性、默认值）
3. 响应格式和状态码
4. 请求和响应示例
5. 错误处理说明',
  true,
  now()
),
(
  '博客文章大纲',
  '为技术博客创建结构化的大纲，确保内容逻辑清晰、易于阅读。',
  '为以下主题创建博客文章大纲：
1. 吸引人的标题
2. 引言（问题背景）
3. 核心概念解释
4. 实践步骤和代码示例
5. 常见问题和解决方案
6. 总结和后续建议',
  true,
  now()
),
(
  '代码重构建议',
  '提供代码重构的具体建议和最佳实践。',
  '分析以下代码并提供重构建议：
1. 识别代码异味
2. 提取重复逻辑
3. 优化函数和类设计
4. 改进命名规范
5. 增强代码可维护性',
  true,
  now()
),
(
  '单元测试生成',
  '为给定的函数或模块生成全面的单元测试。',
  '为以下代码生成单元测试：
1. 正常情况测试
2. 边界条件测试
3. 异常情况测试
4. 模拟依赖项
5. 测试覆盖率分析',
  true,
  now()
);

-- 为提示词添加标签关联
INSERT INTO prompt_tags (prompt_id, tag_id) VALUES
-- 代码审查助手
(1, 2), -- 编程
(1, 8), -- 代码审查
-- API文档生成器
(2, 2), -- 编程
(2, 3), -- 文档
-- 博客文章大纲
(3, 1), -- 写作
(3, 5), -- 博客
-- 代码重构建议
(4, 2), -- 编程
(4, 7), -- 自动化
-- 单元测试生成
(5, 2), -- 编程
(5, 7); -- 自动化

-- 验证数据创建结果
SELECT '创建的提示词数量:' as info, COUNT(*) as count FROM prompts;
SELECT '创建的标签关联数量:' as info, COUNT(*) as count FROM prompt_tags;

-- 查看所有提示词及其标签
SELECT
  p.id,
  p.title,
  p.description,
  array_agg(t.name ORDER BY t.name) as tags
FROM prompts p
LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id, p.title, p.description
ORDER BY p.id;