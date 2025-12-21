# Vercel CLI 部署详细步骤

## 🔐 第一步：登录 Vercel

### 1.1 打开终端并运行登录命令
```bash
# 进入项目目录
cd prompt-lib-landing-page

# 登录 Vercel
vercel login
```

### 1.2 浏览器认证
1. 复制显示的链接：`https://vercel.com/oauth/device?user_code=XXXXX`
2. 在浏览器中打开链接
3. 输入显示的验证码
4. 使用您的 GitHub、GitLab 或 Email 账户登录
5. 授权 Vercel 访问您的账户

### 1.3 验证登录状态
```bash
# 检查登录状态
vercel whoami
```

## 🏗️ 第二步：初始化项目

### 2.1 首次部署设置
```bash
# 初始化 Vercel 项目
vercel
```

### 2.2 配置项目选项
当提示配置项目时，选择以下选项：

```
? Link to an existing project? No
? What's your project's name? prompt-lib
? In which directory is your code located? ./
? Want to override the settings? No
```

## 🔧 第三步：配置环境变量

### 3.1 通过 CLI 添加环境变量
```bash
# Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL

# Supabase 匿名密钥
vercel env add NEXT_PUBLIC_SUPABASE_KEY

# Supabase 服务角色密钥
vercel env add SUPABASE_SERVICE_ROLE_KEY

# NextAuth Secret（可选）
vercel env add NEXTAUTH_SECRET

# NextAuth URL（可选）
vercel env add NEXTAUTH_URL
```

### 3.2 环境变量值说明
从您的 Supabase 项目中获取以下信息：

1. **Supabase URL**：
   - 访问 Supabase Dashboard
   - 进入 Settings → API
   - 复制 "Project URL"

2. **Supabase 匿名密钥**：
   - 在 API 页面找到 "anon public" 密钥
   - 格式通常为：`sb_publishable_xxx`

3. **Supabase 服务角色密钥**：
   - 在 API 页面找到 "service_role" 密钥
   - 格式通常为：`eyJ...`（长字符串）

### 3.3 环境变量示例
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_your-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-here
```

## 🚀 第四步：部署项目

### 4.1 部署到预览环境
```bash
# 部署到预览环境（用于测试）
vercel
```

### 4.2 部署到生产环境
```bash
# 部署到生产环境
vercel --prod
```

### 4.3 部署特定分支
```bash
# 部署 dev 分支
git checkout dev
vercel

# 部署 main 分支
git checkout main
vercel --prod
```

## 📊 第五步：验证部署

### 5.1 检查部署状态
1. 查看 Vercel CLI 输出中的部署 URL
2. 在浏览器中访问部署的 URL
3. 测试主要功能：
   - 首页加载
   - 登录功能
   - 提示词查看
   - 管理后台（如适用）

### 5.2 查看部署日志
```bash
# 查看最近的部署
vercel ls

# 查看项目详情
vercel inspect
```

## 🔧 第六步：后续管理

### 6.1 更新环境变量
```bash
# 删除现有环境变量
vercel env rm VARIABLE_NAME

# 添加新的环境变量
vercel env add NEW_VARIABLE_NAME

# 查看所有环境变量
vercel env ls
```

### 6.2 重新部署
```bash
# 提交代码更改后
git add .
git commit -m "更新内容"
git push

# 手动触发重新部署
vercel --prod
```

### 6.3 查看项目设置
```bash
# 打开项目设置页面
vercel open
```

## 🛠️ 常见问题解决

### 问题 1：构建失败
```bash
# 检查构建日志
vercel logs

# 本地测试构建
npm run build
```

### 问题 2：环境变量问题
```bash
# 重新设置环境变量
vercel env rm NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
```

### 问题 3：数据库连接失败
1. 检查 Supabase URL 是否正确
2. 验证 API 密钥是否有效
3. 确认 Supabase RLS 策略设置

### 问题 4：部署后页面空白
1. 检查浏览器控制台错误
2. 验证环境变量是否正确设置
3. 查看构建日志

## 📱 使用部署脚本

我们还提供了自动部署脚本：

### 使用方法
```bash
# 进入项目目录
cd prompt-lib-landing-page

# 运行部署脚本
../deploy.sh
```

### 脚本功能
- 自动检查 Vercel CLI 安装
- 验证登录状态
- 安装项目依赖
- 构建项目
- 提供部署环境选择

## 🌐 部署完成后的 URL

部署成功后，您的应用将在以下地址可用：

- **预览环境**: `https://prompt-lib-git-branch-name.username.vercel.app`
- **生产环境**: `https://prompt-lib.vercel.app`

## 📞 技术支持

如果遇到问题：
1. 查看官方文档：https://vercel.com/docs
2. 检查项目日志：`vercel logs`
3. 联系开发团队

---

**恭喜！您的 AI Prompt Library 已成功部署到 Vercel！** 🎉