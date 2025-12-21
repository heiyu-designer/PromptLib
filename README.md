# AI Prompt Library - 项目说明文档

## 📋 项目概述

AI Prompt Library 是一个基于 Next.js 16 + React 19 + TypeScript 开发的提示词管理和展示平台，提供完整的 B 端管理后台和 C 端用户界面。

### 🎯 核心功能
- 提示词库管理和展示
- 用户认证和权限管理
- 智能搜索和标签分类
- 内容详情查看和复制
- 数据统计和分析

## 🏗️ 技术架构

### 前端技术栈
- **框架**: Next.js 16 (App Router)
- **UI 库**: React 19 + TypeScript
- **样式**: Tailwind CSS 4.0
- **组件库**: shadcn/ui
- **图标**: Lucide React
- **图表**: Recharts 2.15.4

### 后端服务
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth + 自定义认证
- **API**: Next.js API Routes + Server Actions

## 🔐 账号信息

### 管理员账号
- **用户名**: `admin`
- **密码**: `admin123`
- **角色**: 管理员
- **权限**: 完整的后台管理权限

### 普通用户账号
- **用户名**: `heiyu`
- **密码**: `123456`
- **角色**: 普通用户
- **权限**: 浏览和查看提示词详情

## 🌟 主要功能模块

### 1. 用户认证系统
- **登录方式**:
  - 账号密码登录
  - GitHub OAuth 登录（需要配置）
- **角色权限**:
  - 管理员：访问后台 `/admin`
  - 普通用户：访问首页 `/`
- **会话管理**: 基于 localStorage 的简单认证

### 2. 首页功能 (/)
- **提示词展示**: 网格布局展示所有公开提示词
- **搜索功能**: 支持按标题、内容、标签搜索
- **标签筛选**: 多标签组合筛选
- **分页加载**: 每页显示 12 个提示词
- **详情跳转**: 点击查看完整提示词内容

### 3. 提示词详情页 (/prompts/[id])
- **内容展示**:
  - Markdown 格式渲染
  - JSON 格式化显示
  - YAML 配置文件展示
  - 代码高亮显示
- **统计信息**: 浏览次数、复制次数
- **作者信息**: 显示创建者和角色
- **复制功能**: 一键复制提示词内容
- **导航返回**: 支持返回上一页

### 4. 管理后台 (/admin)

#### 4.1 仪表板 (/admin)
- **数据统计**:
  - 提示词总数
  - 标签总数
  - 用户总数
  - 复制事件总数
- **可视化图表**:
  - 时间趋势分析
  - 标签分布图
  - 用户活跃度统计

#### 4.2 提示词管理 (/admin/prompts)
- **CRUD 操作**: 创建、编辑、删除提示词
- **批量操作**: 多选批量处理
- **搜索筛选**: 按标题、标签、状态筛选
- **状态管理**: 公开/私有状态切换
- **统计查看**: 浏览量、复制量统计

#### 4.3 标签管理 (/admin/tags)
- **标签创建**: 添加新标签
- **颜色配置**: 自定义标签颜色
- **关联管理**: 查看标签使用情况

#### 4.4 用户管理 (/admin/users)
- **用户列表**: 查看所有注册用户
- **状态管理**: 启用/禁用用户
- **角色分配**: 管理员权限设置

## 📁 项目结构

### 核心目录
```
prompt-lib-landing-page/
├── app/                    # Next.js App Router 页面
├── components/             # React 组件
├── lib/                   # 工具库和配置
├── public/                # 静态资源
├── types/                 # TypeScript 类型定义
└── README.md             # 项目说明文档
```

### 主要文件说明

#### 页面文件 (app/)
- `app/page.tsx` - 首页，提示词列表展示
- `app/login/page.tsx` - 登录页面
- `app/admin/page.tsx` - 管理后台仪表板
- `app/admin/prompts/page.tsx` - 提示词管理页面
- `app/admin/tags/page.tsx` - 标签管理页面
- `app/admin/users/page.tsx` - 用户管理页面
- `app/prompts/[id]/page.tsx` - 提示词详情页
- `api/prompts/route.ts` - 提示词 API 接口
- `api/debug-prompts/route.ts` - 调试接口

#### 组件文件 (components/)
- `auth/` - 认证相关组件
  - `login-form.tsx` - 登录表单
  - `auth-provider.tsx` - 认证上下文
  - `user-menu.tsx` - 用户菜单
- `home/` - 首页组件
  - `home-page.tsx` - 首页主组件
  - `hero.tsx` - 首页英雄区域
  - `features.tsx` - 功能特性展示
- `prompt/` - 提示词相关组件
  - `copy-button.tsx` - 复制按钮组件
  - `prompt-form.tsx` - 提示词表单
  - `prompt-list.tsx` - 提示词列表
- `ui/` - shadcn/ui 组件库

#### 工具库 (lib/)
- `supabase.ts` - Supabase 数据库连接
- `simple-auth.ts` - 简单认证工具
- `content-renderer.tsx` - 内容格式化渲染
- `database.ts` - 数据库类型定义

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
cd prompt-lib-landing-page
npm install
```

### 环境配置
创建 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 🗄️ 数据库结构

### 主要数据表

#### prompts (提示词表)
- `id`: 主键
- `title`: 标题
- `description`: 描述
- `content`: 内容
- `is_public`: 是否公开
- `view_count`: 浏览次数
- `copy_count`: 复制次数
- `created_at`: 创建时间

#### tags (标签表)
- `id`: 主键
- `name`: 标签名称
- `slug`: URL 友好标识
- `color`: 标签颜色

#### profiles (用户表)
- `id`: 用户 ID
- `username`: 用户名
- `role`: 用户角色
- `created_at`: 创建时间

#### prompt_tags (提示词标签关联表)
- `prompt_id`: 提示词 ID
- `tag_id`: 标签 ID

## 🛠️ 开发指南

### 添加新功能
1. 在 `app/` 中创建页面路由
2. 在 `components/` 中创建可复用组件
3. 在 `lib/` 中添加工具函数
4. 更新 TypeScript 类型定义

### 数据库操作
- 使用 `supabaseAdmin` 进行服务端操作
- 使用 Server Actions 处理表单提交
- 使用 API Routes 处理客户端请求

### 样式规范
- 使用 Tailwind CSS 类名
- 遵循 shadcn/ui 组件规范
- 支持深色/浅色主题切换

## 🔧 常见问题

### Q: 如何添加新的管理员账号？
A: 在 `components/auth/login-form.tsx` 的 `VALID_USERS` 数组中添加新的用户信息。

### Q: 如何配置 GitHub OAuth？
A: 在 Supabase 项目中配置 GitHub OAuth 提供商，并设置正确的回调 URL。

### Q: 如何修改每页显示的提示词数量？
A: 在首页组件中修改 `limit` 参数，默认为 12。

### Q: 如何添加新的内容格式支持？
A: 在 `lib/content-renderer.tsx` 中添加新的格式检测和渲染逻辑。

## 📊 性能优化

### 已实施的优化
- 图片懒加载
- 代码分割和动态导入
- 数据库查询优化
- 缓存策略实施

### 建议的优化
- CDN 配置
- 数据库索引优化
- 服务端渲染优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 📄 许可证

MIT License

---

## 📞 技术支持

如有问题或建议，请联系开发团队。

**最后更新**: 2025-12-21
**版本**: v1.0.0