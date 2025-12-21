# Vercel 部署指南

## 🚀 快速部署步骤

### 1. 前置要求
- Vercel 账户（https://vercel.com）
- GitHub 仓库已连接到 Vercel
- Supabase 项目已创建并配置

### 2. 通过 Vercel 控制台部署（推荐）

#### 2.1 连接 GitHub 仓库
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 选择 "Import Git Repository"
4. 选择您的 GitHub 仓库：`heiyu-designer/PromptLib`
5. 选择分支：`main`（生产环境）或 `dev`（开发环境）

#### 2.2 配置项目设置
```
Project Name: prompt-lib
Framework: Next.js
Root Directory: prompt-lib-landing-page
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### 2.3 配置环境变量
在 Vercel 项目设置中添加以下环境变量：

```env
# Supabase 配置（从您的 Supabase 项目设置中获取）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_your-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 可选配置
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### 3. 通过 Vercel CLI 部署

#### 3.1 安装并登录 Vercel CLI
```bash
# 安装 Vercel CLI（如果未安装）
npm i -g vercel

# 登录 Vercel
vercel login
# 按照提示在浏览器中完成认证
```

#### 3.2 部署项目
```bash
# 进入项目目录
cd prompt-lib-landing-page

# 初始化项目（首次部署）
vercel

# 配置项目选项
- Link to existing project? No
- Project name: prompt-lib
- In which directory is your code located? ./
- Want to override the settings? No

# 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 部署到生产环境
vercel --prod
```

### 4. 部署配置文件说明

项目已包含 `vercel.json` 配置文件：
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### 5. 部署后配置

#### 5.1 域名配置
1. 在 Vercel 项目设置中点击 "Domains"
2. 添加自定义域名（可选）
3. 配置 DNS 记录（如果使用自定义域名）

#### 5.2 环境变量管理
```bash
# 查看环境变量
vercel env ls

# 添加新变量
vercel env add VARIABLE_NAME

# 拉取环境变量到本地
vercel env pull .env.local
```

### 6. 常见问题解决

#### 6.1 构建错误
- 确保所有依赖在 `package.json` 中
- 检查 `next.config.mjs` 配置
- 验证环境变量设置

#### 6.2 环境变量问题
```bash
# 重新设置环境变量
vercel env rm VARIABLE_NAME
vercel env add VARIABLE_NAME
```

#### 6.3 数据库连接问题
- 验证 Supabase URL 和密钥
- 检查 Supabase RLS 策略
- 确认网络连接

### 7. 部署分支策略

#### 7.1 主分支部署
- `main` → 生产环境 (自动部署)
- `dev` → 预览环境 (自动部署)

#### 7.2 手动部署特定分支
```bash
# 部署 dev 分支到预览环境
vercel --scope=your-team

# 部署到生产环境
vercel --prod
```

### 8. 性能优化建议

#### 8.1 构建优化
- 启用 Next.js 的增量静态再生成 (ISR)
- 配置图片优化
- 使用 Vercel Analytics 监控性能

#### 8.2 数据库优化
- 使用 Supabase 边缘函数
- 配置数据库连接池
- 启用查询缓存

### 9. 监控和维护

#### 9.1 部署监控
- Vercel Dashboard 实时日志
- 错误追踪和性能监控
- 自动部署通知

#### 9.2 更新部署
```bash
# 提交代码后自动部署
git add .
git commit -m "更新内容"
git push origin main

# 或手动部署
vercel --prod
```

### 10. 安全配置

#### 10.1 环境变量安全
- 不要在代码中硬编码敏感信息
- 使用 Vercel 的环境变量管理
- 定期轮换 API 密钥

#### 10.2 域名安全
- 启用 HTTPS（Vercel 自动提供）
- 配置安全头部
- 设置 CSP 策略

---

## 📞 技术支持

如遇到部署问题，可以：
1. 查看 [Vercel 文档](https://vercel.com/docs)
2. 检查项目日志
3. 联系开发团队

**部署完成后，您的应用将在以下地址可用：**
- 生产环境：`https://prompt-lib.vercel.app`
- 预览环境：`https://prompt-lib-git-branch-name.username.vercel.app`