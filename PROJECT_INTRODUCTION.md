# AI Prompt Library - 项目完整介绍

## 📋 项目概述

AI Prompt Library 是一个现代化的提示词管理和展示平台，专为 AI 时代的内容创作者和开发者设计。该项目提供了完整的提示词库管理解决方案，包括用户认证、内容管理、搜索筛选和数据统计等核心功能。

### 🎯 核心价值

- **内容聚合**: 统一管理和展示高质量 AI 提示词
- **高效搜索**: 智能搜索和多维度筛选功能
- **用户友好**: 现代化的用户界面和交互体验
- **权限管理**: 基于角色的访问控制系统
- **数据洞察**: 详细的浏览和复制统计

## 🏗️ 技术架构

### 前端技术栈
- **框架**: Next.js 16 (App Router) + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS 4.0
- **组件库**: shadcn/ui + Radix UI
- **图标**: Lucide React
- **图表**: Recharts 2.15.4

### 后端服务
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth + 自定义认证系统
- **API**: Next.js API Routes + Server Actions
- **部署**: Vercel

### 数据库设计
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    profiles     │  │    prompts      │  │      tags       │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │  │ id (PK)         │
│ username        │  │ title           │  │ name            │
│ role            │  │ description     │  │ slug            │
│ status          │  │ content         │  │ color           │
│ created_at      │  │ cover_image_url │  │ created_at      │
└─────────────────┘  │ is_public       │  └─────────────────┘
                     │ author_id       │
                     │ view_count      │
                     │ copy_count      │
                     │ created_at      │
                     └─────────────────┘
                              │
                              │
                ┌─────────────────┼─────────────────┐
                │  prompt_tags    │  copy_events     │
                ├─────────────────┤  ├─────────────────┤
                │ prompt_id (FK)  │  │ id (PK)         │
                │ tag_id (FK)     │  │ prompt_id (FK)  │
                └─────────────────┘  │ user_id         │
                                     │ ip_address      │
                                     │ created_at      │
                                     └─────────────────┘
```

## 🌟 核心功能模块

### 1. 用户认证系统
#### 功能特性
- **双重认证方式**: 账号密码登录 + GitHub OAuth
- **角色权限管理**:
  - 管理员 (admin): 完整的后台管理权限
  - 普通用户 (user): 浏览和查看权限
- **会话管理**: 基于 localStorage 的简单认证
- **开发环境优化**: 自动开发管理员权限

#### 技术实现
```typescript
// 硬编码用户验证（适合演示）
const VALID_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'heiyu', password: '123456', role: 'user' }
]

// 基于角色的路由跳转
const redirectPath = validUser.role === 'admin' ? '/admin' : '/'
```

### 2. 首页展示系统
#### 功能特性
- **提示词列表**: 网格布局展示所有公开提示词
- **智能搜索**: 支持标题、内容、标签全文搜索
- **标签筛选**: 多标签组合筛选功能
- **分页加载**: 每页显示 12 个提示词，优化性能
- **响应式设计**: 完美适配移动端和桌面端

#### 核心组件
```tsx
// 搜索和筛选组件
<SearchBar onSearch={handleSearch} />
<TagFilter selectedTags={selectedTags} onTagSelect={handleTagSelect} />

// 提示词卡片组件
<PromptCard
  prompt={prompt}
  onViewDetails={handleViewDetails}
  onCopy={handleCopy}
/>
```

### 3. 提示词详情页
#### 功能特性
- **多格式渲染**:
  - Markdown 格式化显示
  - JSON 结构化展示
  - YAML 配置文件渲染
  - 代码高亮显示
- **统计信息**: 浏览次数、复制次数、作者信息
- **复制功能**: 一键复制提示词内容
- **导航优化**: 支持返回上一页

#### 内容渲染器
```tsx
// 智能内容类型检测
function detectContentType(content: string): 'markdown' | 'json' | 'yaml' | 'code' | 'text'

// 格式化渲染组件
<ContentRenderer content={prompt.content} />
```

### 4. 管理后台系统
#### 仪表板功能
- **数据统计**: 提示词总数、标签总数、用户总数、复制事件统计
- **可视化图表**:
  - 时间趋势分析 (Recharts)
  - 标签分布饼图
  - 用户活跃度统计
- **实时数据**: 支持数据刷新和实时更新

#### 提示词管理
- **CRUD 操作**: 创建、编辑、删除提示词
- **批量操作**: 多选批量处理
- **状态管理**: 公开/私有状态切换
- **搜索筛选**: 按标题、标签、状态筛选
- **统计查看**: 实时浏览量、复制量统计

#### 标签管理
- **标签创建**: 添加新标签并设置颜色
- **关联管理**: 查看标签使用情况
- **颜色配置**: 自定义标签颜色主题

#### 用户管理
- **用户列表**: 查看所有注册用户
- **状态管理**: 启用/禁用用户
- **权限分配**: 管理员权限设置
- **密码重置**: 支持管理员重置用户密码

## 🎨 用户界面设计

### 设计原则
- **现代化设计**: 简洁、专业、易用
- **响应式布局**: 完美适配各种屏幕尺寸
- **无障碍支持**: 符合 WCAG 2.1 标准
- **深色模式**: 支持明暗主题切换

### 核心页面
1. **首页** (`/`): 提示词列表展示
2. **登录页** (`/login`): 用户认证入口
3. **详情页** (`/prompts/[id]`): 提示词详情查看
4. **管理后台** (`/admin/*`): 完整的管理功能

### UI 组件库
基于 shadcn/ui 构建，包含：
- Button, Input, Label, Card
- Badge, Avatar, Tabs
- Alert, Dialog, Dropdown
- Charts (Recharts 集成)

## 🔧 开发配置

### 项目结构
```
prompt-lib-landing-page/
├── app/                    # Next.js App Router 页面
│   ├── (auth)/            # 认证相关页面组
│   ├── admin/             # 管理后台页面
│   ├── api/               # API 路由
│   └── prompts/           # 提示词相关页面
├── components/            # React 组件
│   ├── auth/             # 认证组件
│   ├── home/             # 首页组件
│   ├── prompt/           # 提示词组件
│   └── ui/               # shadcn/ui 组件
├── lib/                  # 工具库
│   ├── supabase.ts       # 数据库连接
│   ├── simple-auth.ts    # 认证工具
│   └── content-renderer.tsx # 内容渲染
├── hooks/                # 自定义 React Hooks
└── types/                # TypeScript 类型定义
```

### 环境配置
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Next.js 配置
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret
```

## 📊 数据统计和分析

### 统计指标
- **内容统计**: 提示词总数、公开/私有比例、标签分布
- **用户行为**: 浏览量、复制量、访问趋势
- **热门内容**: 最受欢迎的提示词排行
- **用户活跃度**: 日活用户、使用频率

### 可视化组件
```tsx
// 趋势分析图表
<TrendCard
  title="提示词增长趋势"
  data={promptGrowthData}
  type="line"
/>

// 标签分布图
<PieChart
  data={tagDistribution}
  title="标签使用分布"
/>
```

## 🔐 安全特性

### 认证安全
- **环境变量保护**: 敏感信息不暴露在客户端
- **输入验证**: 使用 Zod 进行数据验证
- **SQL 注入防护**: Supabase RSL 策略
- **XSS 防护**: React 内置安全机制

### 权限控制
- **基于角色的访问控制 (RBAC)**
- **路由保护**: Middleware + 服务端验证
- **API 访问控制**: Server Actions 权限检查

## 🚀 部署架构

### 生产环境
- **部署平台**: Vercel
- **域名**: https://prompt-lib-amber.vercel.app
- **CDN**: Vercel Edge Network
- **数据库**: Supabase (全球分布式)

### 开发环境
- **本地开发**: `npm run dev` (端口 30001)
- **数据库**: Supabase 本地开发环境
- **环境变量**: `.env.local` 配置

## 📈 性能优化

### 前端优化
- **代码分割**: Next.js 自动代码分割
- **图片优化**: Next.js Image 组件
- **缓存策略**: 静态资源缓存
- **懒加载**: 组件和图片懒加载

### 数据库优化
- **查询优化**: 索引优化、查询缓存
- **分页加载**: 避免大数据集加载
- **连接池**: Supabase 连接管理

## 🧪 测试策略

### 测试覆盖
- **单元测试**: 核心业务逻辑测试
- **集成测试**: API 接口测试
- **E2E 测试**: 关键用户流程测试
- **性能测试**: 页面加载和交互性能

### 测试工具
- **Jest**: 单元测试框架
- **React Testing Library**: React 组件测试
- **Playwright**: E2E 自动化测试

## 📝 API 文档

### 核心接口
```typescript
// 获取提示词列表
GET /api/prompts?limit=12&page=1&search=keyword

// 获取提示词详情
GET /api/prompts/[id]

// 复制提示词
POST /api/prompts/[id]/copy

// 搜索提示词
GET /api/search?q=keyword&tags=tag1,tag2
```

### 数据模型
```typescript
interface Prompt {
  id: number
  title: string
  description: string
  content: string
  cover_image_url?: string
  is_public: boolean
  view_count: number
  copy_count: number
  created_at: string
  tags?: Tag[]
}

interface User {
  id: string
  username: string
  role: 'admin' | 'user'
  status: 'active' | 'banned'
}
```

## 🔮 未来规划

### 短期目标 (1-3个月)
- [ ] 完善用户个人资料管理
- [ ] 添加提示词收藏功能
- [ ] 实现评论和评分系统
- [ ] 优化移动端体验

### 中期目标 (3-6个月)
- [ ] 支持多种语言国际化
- [ ] 添加提示词模板库
- [ ] 实现 AI 辅助提示词生成
- [ ] 集成第三方 AI 服务

### 长期目标 (6-12个月)
- [ ] 构建插件生态系统
- [ ] 支持团队协作功能
- [ ] 实现高级分析报告
- [ ] 开发移动端应用

## 🤝 贡献指南

### 开发流程
1. Fork 项目到个人仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 代码规范
- 遵循 TypeScript 严格模式
- 使用 ESLint + Prettier 格式化
- 组件使用函数式组件 + Hooks
- 提交信息遵循 Conventional Commits

### 文档要求
- 新功能需要添加相应文档
- API 接口需要详细注释
- 复杂逻辑需要解释说明

## 📞 技术支持

### 联系方式
- **项目仓库**: https://github.com/heiyu-designer/PromptLib
- **问题反馈**: GitHub Issues
- **技术文档**: 项目 README.md

### 常见问题
1. **部署问题**: 参考 DEPLOYMENT_GUIDE.md
2. **环境配置**: 参考 .env.local.example
3. **API 接口**: 参考 API 文档章节

---

**AI Prompt Library** - 为 AI 时代的内容创作者提供专业的提示词管理解决方案。

**最后更新**: 2025-12-21
**版本**: v1.0.0
**维护者**: Claude Sonnet 4.5