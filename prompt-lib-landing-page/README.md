# PromptLib - AI 提示词库

一个基于 Next.js 和 Supabase 构建的现代化 AI 提示词管理和分享平台。

## ✨ 功能特性

### 🎯 核心功能
- **提示词管理**: 完整的 CRUD 操作，支持 Markdown 格式
- **智能搜索**: 支持标题、内容、标签的模糊搜索和相关度排序
- **标签系统**: 灵活的标签分类和筛选功能
- **用户认证**: 支持 GitHub、Google OAuth 和邮箱登录
- **复制追踪**: 统计复制次数，管理员可配置复制成功消息
- **响应式设计**: 完美适配桌面端和移动端

### 🛠️ 管理功能
- **用户管理**: 用户列表、封禁/解封、密码重置
- **标签管理**: 标签的增删改查，支持 URL 别名
- **内容管理**: 提示词的审核、编辑、删除
- **系统设置**: 网站配置、复制消息自定义
- **数据统计**: 浏览量、复制次数等关键指标

### 🚀 技术特性
- **TypeScript**: 完整的类型安全
- **Next.js 14**: App Router + Server Actions
- **Tailwind CSS**: 现代化的样式系统
- **shadcn/ui**: 优雅的 UI 组件库
- **Supabase**: 数据库 + 认证 + 实时功能
- **RLS 安全**: 行级安全策略保护数据

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Supabase 账号

### 1. 克隆项目
```bash
git clone <repository-url>
cd prompt-lib-landing-page
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.local.example .env.local

# 编辑环境变量，填入你的 Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_URL=http://localhost:30001
NEXTAUTH_SECRET=your-secret-key
```

### 4. 数据库设置
1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 Supabase SQL 编辑器中执行 [`database-schema.sql`](./database-schema.sql)
3. 在 Supabase 控制台的 Authentication > Settings 中配置：
   - GitHub OAuth: 获取 GitHub OAuth App 凭据
   - Google OAuth: 获取 Google OAuth 客户端 ID

### 5. 创建管理员用户
```bash
# 在 Supabase SQL 编辑器中执行
SELECT create_admin_user('admin@example.com', 'your-password', 'admin');
```

### 6. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:30001 查看应用。

## 📁 项目结构

```
prompt-lib-landing-page/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   ├── prompts.ts            # 提示词相关操作
│   │   ├── tags.ts               # 标签相关操作
│   │   ├── users.ts              # 用户管理操作
│   │   └── copy.ts               # 复制功能和设置
│   ├── admin/                    # 管理后台
│   │   ├── page.tsx              # 仪表板
│   │   ├── prompts/              # 提示词管理
│   │   ├── tags/                 # 标签管理
│   │   ├── users/                # 用户管理
│   │   └── settings/             # 系统设置
│   ├── auth/                     # 认证相关路由
│   ├── components/               # 组件
│   │   ├── auth/                 # 认证组件
│   │   ├── home/                 # 首页组件
│   │   ├── search/               # 搜索组件
│   │   └── ui/                   # 基础 UI 组件
│   ├── lib/                      # 工具库
│   │   ├── supabase.ts           # Supabase 客户端
│   │   ├── database.ts           # 数据库类型
│   │   ├── search.ts             # 搜索工具
│   │   └── metadata.ts           # SEO 工具
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页
│   ├── sitemap.ts                # 网站地图
│   └── robots.ts                 # 爬虫规则
├── components/                   # 共享组件
├── lib/                          # 共享工具库
├── public/                       # 静态资源
├── database-schema.sql           # 数据库架构
├── .env.local.example            # 环境变量模板
└── README.md                     # 项目说明
```

## 🎨 主要组件

### 认证系统
- **AuthProvider**: 全局认证状态管理
- **中间件**: 路由保护和权限验证
- **登录组件**: 支持 OAuth 和邮箱登录
- **用户菜单**: 用户资料和功能访问

### 搜索系统
- **AdvancedSearch**: 增强搜索体验，包含建议和历史
- **搜索算法**: 基于相关度的智能排序
- **搜索工具**: 高亮、建议、元数据生成

### 数据管理
- **Server Actions**: 服务端数据操作
- **类型安全**: 完整的 TypeScript 类型定义
- **错误处理**: 统一的错误处理和用户反馈

## 🚀 部署

### Vercel 部署（推荐）
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署完成

### 手动部署
```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 🔧 配置说明

### 环境变量
| 变量名 | 描述 | 必需 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | ✅ |
| `NEXTAUTH_URL` | 应用基础 URL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | ✅ |
| `NEXT_PUBLIC_SITE_URL` | 网站公开 URL | ❌ |
| `GOOGLE_SITE_VERIFICATION` | Google 站点验证 | ❌ |

### 数据库配置
- 执行 `database-schema.sql` 创建表结构
- 配置 OAuth 提供商
- 设置 RLS 策略
- 创建初始管理员用户

## 🎯 开发指南

### 添加新功能
1. 在 `app/actions/` 中创建 Server Actions
2. 在 `lib/` 中添加类型定义和工具函数
3. 创建对应的组件页面
4. 更新路由和权限配置

### 数据库更改
1. 修改 `database-schema.sql`
2. 在 Supabase 中执行迁移
3. 更新 `lib/database.ts` 类型定义
4. 更新相关 Server Actions

### 样式开发
- 使用 Tailwind CSS 类名
- 优先使用 shadcn/ui 组件
- 遵循移动优先的响应式设计

## 🛡️ 安全性

- **RLS 策略**: 数据库行级安全
- **输入验证**: Zod schema 验证
- **XSS 防护**: 内容转义和 CSP
- **CSRF 防护**: SameSite cookies
- **权限控制**: 基于角色的访问控制

## 📊 性能优化

- **代码分割**: 动态导入和路由级分割
- **图片优化**: Next.js Image 组件
- **缓存策略**: ISR 和数据缓存
- **SEO 优化**: 动态 sitemap 和 metadata
- **Core Web Vitals**: 性能监控和优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🆘 支持

如果您遇到问题或有疑问，请：

1. 查看 [FAQ](./docs/FAQ.md)
2. 搜索 [Issues](../../issues)
3. 创建新的 Issue
4. 联系开发团队

---

**PromptLib** - 让 AI 提示词管理变得简单高效 🚀