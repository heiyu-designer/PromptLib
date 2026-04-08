# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指导。

## 项目概述

PromptLib 是一个 AI 提示词管理与分享平台，基于 Next.js 16、React 19、TypeScript 构建。提供提示词浏览、管理和分享的全栈功能，支持双认证系统（开发环境使用 localStorage，生产环境使用 Supabase Auth）。

## 开发命令

```bash
# 安装依赖（使用 npm，不使用 pnpm）
npm install

# 启动开发服务器（端口 39728）
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 运行代码检查
npm run lint
```

## 架构概览

### 技术栈
- **框架**: Next.js 16 (App Router) + React 19
- **样式**: Tailwind CSS 4 + shadcn/ui + Radix UI
- **数据库**: PostgreSQL 15（Docker 容器 promptlib-db）
- **图表**: Recharts 2.x
- **部署**: Vercel

### 目录结构
```
prompt-lib-landing-page/
├── app/
│   ├── actions/           # Server Actions（数据库写操作）
│   ├── admin/             # 管理后台页面
│   ├── api/               # API 路由（客户端数据获取）
│   │   ├── admin/prompts/ # 管理后台提示词 API
│   │   ├── debug-prompts/ # 调试用提示词 API
│   │   └── prompts/[id]/  # 单个提示词详情 API
│   ├── prompts/[id]/      # 提示词详情页
│   └── login/             # 登录页面
├── components/
│   ├── auth/              # 认证组件
│   ├── home/              # 首页组件
│   ├── prompts/           # 提示词组件
│   └── ui/                # shadcn/ui 基础组件
├── lib/
│   ├── server-db.ts       # PostgreSQL 连接池（服务器端专用）
│   ├── supabase.ts        # Server Actions 封装
│   └── simple-auth.ts     # localStorage 认证
└── database/              # Docker PostgreSQL 配置
```

### 数据库架构（本地 PostgreSQL）

**连接信息**: `localhost:5432`, 数据库名 `promptlib`

核心表：`profiles`、`prompts`、`tags`、`prompt_tags`、`copy_events`

- **`profiles`**: 用户档案，包含 `id`、`username`、`role`（'admin'|'user'）、`status`
- **`prompts`**: 提示词内容，包含 `title`、`description`、`content`、`cover_image_url`、`is_public`、`view_count`、`copy_count`
- **`tags`**: 标签定义，包含 `name`、`slug`、`color`
- **`prompt_tags`**: prompts 和 tags 的多对多关联表

### 认证系统

**开发环境**: 基于 `lib/simple-auth.ts` 中的 localStorage 认证。硬编码凭据：
- `admin / admin123`（管理员）
- `heiyu / 123456`（普通用户）
- `ziye / 123456`（普通用户）

**生产环境**: Supabase Auth（需配置云数据库）

### 关键开发模式

1. **API Routes 用于客户端数据获取**: `app/api/` 下的路由用于客户端组件获取数据，避免 Next.js Server Actions 哈希问题
2. **Server Actions 用于数据变更**: `app/actions/` 和 `lib/supabase.ts` 封装数据库写操作
3. **server-db.ts 专用于服务器端**: 使用动态 `import('pg')` 避免客户端打包问题
4. **管理后台路由保护**: `app/admin/layout.tsx` 检查认证状态并重定向非管理员用户

## 常见开发注意事项

### 添加新用户（开发模式）
在 `components/auth/login-form.tsx` 的 `VALID_USERS` 数组中添加新用户。

### 环境变量配置
`.env.local` 中的关键配置：
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=promptlib
DB_USER=postgres
DB_PASSWORD=promptlib123
```

### Docker 数据库
PostgreSQL 容器名为 `promptlib-db`，通过 `database/docker-compose.yml` 配置。

### 添加新 UI 组件
使用 shadcn/ui CLI：
```bash
npx shadcn@latest add <component>
```

### 数据库操作
- 读取：`lib/server-db.ts` 的 `query()` / `queryOne()`
- 写入：通过 API routes 或 Server Actions
- 注意：`pg` 模块只能用于服务器端，使用动态导入
