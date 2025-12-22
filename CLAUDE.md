# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用开发命令

```bash
# 开发环境
npm run dev          # 在端口 30001 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 在端口 30001 启动生产服务器
npm run lint         # 运行 ESLint 检查

# 开发环境快速获取管理员权限
# 在浏览器控制台中运行: setDevAdmin()
```

## 项目架构

### 双重认证系统
项目采用混合认证方式：

**开发环境:**
- 基于 localStorage 的简单认证，见 `lib/simple-auth.ts`
- 硬编码用户在 `components/auth/login-form.tsx` 中
  - 管理员：admin/admin123
  - 普通用户：heiyu/123456、ziye/123456
- 使用 `setDevAdmin()` 在浏览器控制台快速获取管理员权限

**生产环境:**
- Supabase Auth 支持 OAuth 登录（GitHub、Google）
- 数据库级别的 RLS（行级安全）策略控制数据访问

### 数据库架构
- **数据表**: `prompts`（提示词）、`tags`（标签）、`prompt_tags`（关联）、`profiles`（用户）、`copy_events`（复制事件）、`settings`（设置）
- **客户端**: `lib/supabase.ts` 导出 `supabase`（客户端）和 `supabaseAdmin`（服务端）
- **类型定义**: `lib/database.ts` 中扩展 Supabase 自动生成的类型

### 数据管理模式
- **Server Actions**: 所有特权数据库操作在 `app/actions/` 目录中（prompts.ts、tags.ts、users.ts）
- **API Routes**: 客户端数据获取在 `app/api/` 目录中
- **输入验证**: 所有表单和 API 输入使用 Zod 模式验证
- **乐观更新**: 用于提升用户体验

### 内容渲染系统
- 多格式支持在 `lib/content-renderer.tsx` 中：Markdown、JSON、YAML
- 使用 react-syntax-highlighter 进行代码高亮
- 复制功能带分析追踪

### 组件组织结构
```
components/
├── auth/          # 认证组件（登录表单、认证提供者、用户菜单）
├── home/          # 首页组件（英雄区域、功能展示）
├── prompt/        # 提示词相关组件（列表、复制按钮、表单）
├── search/        # 搜索和筛选组件
├── admin/         # 管理后台组件
└── ui/            # shadcn/ui 组件库
```

### 关键技术细节

**端口配置:**
- 开发服务器运行在端口 30001（在 package.json 和 .env.local.example 中配置）

**环境变量:**
- 必需：`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_KEY`
- 管理操作：`SUPABASE_SERVICE_ROLE_KEY`
- 从 `.env.local.example` 复制配置

**认证流程:**
1. 检查 `lib/simple-auth.ts` 中的基于 localStorage 的认证
2. 管理员用户重定向到 `/admin`，普通用户到 `/`
3. 全应用基于角色的访问控制

**管理系统:**
- 通过 Server Actions 实现完整的 CRUD 操作
- 使用 Recharts 的数据可视化仪表板
- 用户管理和角色分配
- 系统设置配置

**数据库操作:**
- Server Actions 使用 `supabaseAdmin`（具有提升权限）
- 客户端操作使用常规 `supabase` 客户端
- 所有数据库更改都应通过 Server Actions 以确保安全

**开发助手:**
```javascript
// 浏览器控制台中快速获取管理员权限
setDevAdmin()
```

## 安全注意事项
- 在数据库级别实施 RLS 策略
- 所有管理员操作使用带 `supabaseAdmin` 的 Server Actions
- 使用 Zod 模式进行输入验证
- 基于环境的配置（开发与生产）