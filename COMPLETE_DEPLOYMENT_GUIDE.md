# AI Prompt Library - 完整部署指南

## 📋 部署概览

本指南详细介绍了 AI Prompt Library 项目的完整部署流程，包括开发环境搭建、生产环境部署、域名配置和运维监控。

### 🎯 部署目标
- **开发环境**: 本地开发和测试
- **生产环境**: Vercel 云端部署
- **数据库**: Supabase 云端数据库
- **域名配置**: 自定义域名绑定

## 🛠️ 环境要求

### 系统要求
- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本
- **Git**: 用于版本控制
- **现代浏览器**: Chrome、Firefox、Safari、Edge

### 开发工具推荐
- **IDE**: VS Code + 官方插件
- **API 测试**: Postman 或 Insomnia
- **数据库管理**: Supabase Dashboard
- **部署工具**: Vercel CLI

## 📦 项目获取和初始化

### 1. 克隆项目
```bash
# 克隆项目到本地
git clone https://github.com/heiyu-designer/PromptLib.git

# 进入项目目录
cd PromptDb/prompt-lib-landing-page
```

### 2. 安装依赖
```bash
# 安装项目依赖
npm install

# 或者使用 pnpm
pnpm install

# 或者使用 yarn
yarn install
```

### 3. 验证安装
```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 测试项目启动
npm run dev
```

## 🗄️ 数据库配置

### 1. 创建 Supabase 项目

#### 步骤 1: 注册 Supabase 账户
1. 访问 [Supabase](https://supabase.com)
2. 使用 GitHub 或邮箱注册
3. 创建新组织（如果需要）

#### 步骤 2: 创建新项目
1. 点击 "New Project"
2. 选择组织
3. 设置项目信息：
   - 项目名称：`ai-prompt-library`
   - 数据库密码：生成强密码并保存
   - 地区：选择离用户最近的区域
4. 点击 "Create new project"

#### 步骤 3: 获取项目信息
创建完成后，记录以下信息：
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Key**: `sb_publishable_xxx`
- **Service Role Key**: `eyJ...` (长字符串)

### 2. 配置数据库结构

#### 方法一：使用 SQL 脚本
1. 进入 Supabase Dashboard
2. 选择项目 → "SQL Editor"
3. 执行以下 SQL 脚本：

```sql
-- 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建 tags 表
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建 prompts 表
CREATE TABLE IF NOT EXISTS prompts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建 prompt_tags 关联表
CREATE TABLE IF NOT EXISTS prompt_tags (
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, tag_id)
);

-- 创建 copy_events 表
CREATE TABLE IF NOT EXISTS copy_events (
  id SERIAL PRIMARY KEY,
  prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建 settings 表
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认设置
INSERT INTO settings (id, settings) VALUES (1, '{
  "copy_success_message": "提示词已复制到剪贴板！",
  "site_name": "AI Prompt Library",
  "site_description": "发现高质量 AI 提示词",
  "allow_public_submissions": false,
  "require_approval": false
}') ON CONFLICT (id) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_author_id ON prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);
CREATE INDEX IF NOT EXISTS idx_copy_events_prompt_id ON copy_events(prompt_id);

-- 插入示例标签
INSERT INTO tags (name, slug, color) VALUES
('ChatGPT', 'chatgpt', '#10A37F'),
('Claude', 'claude', '#D97706'),
('编程', 'programming', '#3B82F6'),
('写作', 'writing', '#8B5CF6'),
('设计', 'design', '#EC4899'),
('营销', 'marketing', '#F59E0B')
ON CONFLICT DO NOTHING;
```

#### 方法二：使用 Supabase CLI
```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录 Supabase
supabase login

# 链接项目
supabase link --project-ref your-project-id

# 执行 SQL 文件
supabase db push
```

### 3. 配置 RLS (Row Level Security)

```sql
-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public prompts are viewable by everyone" ON prompts
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own prompts" ON prompts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 更多策略根据需要添加
```

### 4. 创建管理员用户
```sql
-- 创建管理员用户（使用硬编码认证时）
INSERT INTO profiles (id, username, role, status) VALUES
('admin-id-here', 'admin', 'admin', 'active')
ON CONFLICT (id) DO NOTHING;
```

## 🔧 环境配置

### 1. 本地环境变量

创建 `.env.local` 文件：
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_your-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Next.js 配置
NEXTAUTH_URL=http://localhost:30001
NEXTAUTH_SECRET=your-nextauth-secret-here

# 开发环境标识
NODE_ENV=development
```

### 2. 生产环境变量

在部署平台中配置：
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_your-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Next.js 配置
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret-here

# 生产环境标识
NODE_ENV=production
```

## 🚀 本地开发环境

### 1. 启动开发服务器
```bash
# 启动开发服务器
npm run dev

# 或者指定端口
npm run dev -- --port 30001
```

### 2. 访问应用
- **首页**: http://localhost:30001
- **登录页**: http://localhost:30001/login
- **管理后台**: http://localhost:30001/admin

### 3. 开发工具配置

#### VS Code 插件推荐
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json"
  ]
}
```

#### ESLint 配置
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "prefer-const": "warn"
  }
}
```

## 🌐 生产环境部署

### 方法一：Vercel CLI 部署（推荐）

#### 1. 安装 Vercel CLI
```bash
# 全局安装
npm install -g vercel

# 验证安装
vercel --version
```

#### 2. 登录 Vercel
```bash
# 登录 Vercel
vercel login

# 按照提示在浏览器中完成认证
```

#### 3. 部署项目
```bash
# 进入项目目录
cd prompt-lib-landing-page

# 初始化项目（首次部署）
vercel

# 部署到生产环境
vercel --prod
```

#### 4. 配置环境变量
```bash
# 添加 Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL

# 添加 Supabase Key
vercel env add NEXT_PUBLIC_SUPABASE_KEY

# 添加 Service Role Key
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 添加 NextAuth URL
vercel env add NEXTAUTH_URL
```

### 方法二：Vercel 控制台部署

#### 1. 导入 GitHub 仓库
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 选择 "Import Git Repository"
4. 授权 GitHub 并选择仓库
5. 配置项目设置

#### 2. 配置构建设置
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "rootDirectory": "prompt-lib-landing-page"
}
```

#### 3. 配置环境变量
在项目设置 → Environment Variables 中添加：
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_your-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🌍 域名配置

### 1. Vercel 域名设置

#### 方法一：使用 Vercel 子域名
1. 进入 Vercel Dashboard
2. 选择项目 → "Settings" → "Domains"
3. 输入想要的子域名（如：`prompt-lib`）
4. 系统会自动配置 DNS

#### 方法二：使用自定义域名
1. 添加域名到 Vercel 项目
2. 配置 DNS 记录：
   ```
   类型: CNAME
   名称: @ (或 www)
   值: cname.vercel-dns.com
   TTL: 300
   ```

### 2. 域名验证
```bash
# 检查域名解析
nslookup your-domain.com

# 检查 SSL 证书
curl -I https://your-domain.com
```

## 📊 监控和运维

### 1. Vercel 监控

#### 功能概览
- **构建日志**: 实时构建状态和错误信息
- **函数日志**: Server-side 函数执行日志
- **访问分析**: 网站访问统计
- **错误追踪**: 自动错误捕获和报告

#### 使用方法
```bash
# 查看项目详情
vercel inspect

# 查看函数日志
vercel logs --follow

# 查看访问统计
vercel analytics
```

### 2. Supabase 监控

#### 监控指标
- **数据库连接**: 连接数和性能
- **查询性能**: 慢查询识别
- **存储使用**: 数据存储量统计
- **API 调用**: Auth 和 Storage API 使用情况

#### 监控设置
1. 进入 Supabase Dashboard
2. 项目 → "Settings" → "Monitoring"
3. 配置告警阈值和通知

### 3. 性能优化

#### 前端优化
```typescript
// 图片优化配置
const nextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
}

// 代码分割
import dynamic from 'next/dynamic'
const Component = dynamic(() => import('./Component'), {
  loading: () => <Loading />
})
```

#### 数据库优化
```sql
-- 创建复合索引
CREATE INDEX idx_prompts_public_created ON prompts(is_public, created_at DESC);
CREATE INDEX idx_prompts_search ON prompts USING GIN(to_tsvector('english', title || ' ' || content));

-- 查询优化
EXPLAIN ANALYZE SELECT * FROM prompts WHERE is_public = true ORDER BY created_at DESC LIMIT 12;
```

## 🔧 故障排除

### 常见问题及解决方案

#### 1. 部署失败
**问题**: 构建错误或部署失败
```bash
# 检查本地构建
npm run build

# 查看详细错误日志
vercel logs

# 清理缓存重新部署
rm -rf .next node_modules
npm install
npm run build
```

#### 2. 数据库连接失败
**问题**: Supabase 连接错误
```javascript
// 检查环境变量
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_KEY);

// 测试连接
import { supabase } from '@/lib/supabase'
const { data, error } = await supabase.from('prompts').select('count').single()
```

#### 3. 环境变量缺失
**问题**: 环境变量未正确配置
```bash
# 检查环境变量
vercel env ls

# 重新添加环境变量
vercel env add VARIABLE_NAME production
```

#### 4. 类型错误
**问题**: TypeScript 编译错误
```typescript
// 临时解决方案
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
}

// 长期解决方案：修复类型错误
interface Database {
  public: {
    Tables: {
      your_table: {
        Row: { id: number; name: string }
      }
    }
  }
}
```

### 调试工具

#### 1. 浏览器开发者工具
```javascript
// 检查网络请求
fetch('/api/prompts')
  .then(res => res.json())
  .then(data => console.log(data))

// 检查环境变量
console.log('Environment:', process.env.NODE_ENV)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

#### 2. Vercel CLI 调试
```bash
# 本地预览
vercel

# 部署预览
vercel --confirm

# 查看部署日志
vercel logs [deployment-url]
```

## 📝 部署检查清单

### 部署前检查
- [ ] 项目依赖安装完成
- [ ] 环境变量配置正确
- [ ] 本地构建成功
- [ ] 数据库表结构创建完成
- [ ] RLS 策略配置完成

### 部署后验证
- [ ] 网站可以正常访问
- [ ] 登录功能正常工作
- [ ] 提示词列表正常显示
- [ ] 搜索功能正常
- [ ] 管理后台可以访问
- [ ] 复制功能正常
- [ ] 数据统计正常显示

### 性能检查
- [ ] 页面加载时间 < 3 秒
- [ ] 图片优化正常
- [ ] 移动端适配良好
- [ ] SEO 元数据完整
- [ ] 错误页面配置正确

## 🔄 CI/CD 流程

### 自动部署配置

#### GitHub Actions 配置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 环境变量管理
```bash
# GitHub Secrets
VERCEL_TOKEN=your-vercel-token
ORG_ID=your-org-id
PROJECT_ID=your-project-id
```

## 📚 相关文档

- [项目介绍](./PROJECT_INTRODUCTION.md)
- [Vercel 部署指南](./VERCEL_CLI_DEPLOYMENT.md)
- [404 错误修复](./VERCEL_404_FIX.md)
- [环境变量配置](./VERCEL_ENV_FIX.md)
- [API 文档](./API_DOCUMENTATION.md)
- [贡献指南](./CONTRIBUTING.md)

---

## 🎉 部署完成

恭喜！您已经成功部署了 AI Prompt Library 项目。

### 下一步建议
1. **数据迁移**: 如果有现有数据，迁移到 Supabase
2. **性能优化**: 根据实际使用情况优化性能
3. **功能扩展**: 添加更多高级功能
4. **用户反馈**: 收集用户反馈并持续改进

### 技术支持
- **GitHub Issues**: 报告问题和建议
- **项目文档**: 详细的技术文档
- **社区支持**: 开发者社区交流

**最后更新**: 2025-12-21
**版本**: v1.0.0
**维护者**: AI Prompt Library Team