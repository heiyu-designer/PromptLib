# PromptLib 测试指南

## 🧪 测试环境准备

### 1. 环境配置
```bash
# 确保端口 30001 没有被占用
lsof -ti:30001 | xargs kill -9 2>/dev/null || true

# 启动开发服务器
npm run dev
```

### 2. 数据库测试
在 Supabase SQL 编辑器中执行以下测试查询：

```sql
-- 检查表是否正确创建
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 检查初始数据
SELECT * FROM tags;
SELECT COUNT(*) as prompt_count FROM prompts;
SELECT * FROM settings;
```

## 🔍 功能测试清单

### 基础功能测试
- [ ] 应用能正常启动 (http://localhost:30001)
- [ ] 首页能正常加载
- [ ] 搜索功能正常工作
- [ ] 标签筛选正常
- [ ] 分页加载正常

### 用户认证测试
- [ ] GitHub OAuth 登录
- [ ] Google OAuth 登录
- [ ] 用户状态持久化
- [ ] 登录后显示用户菜单
- [ ] 退出登录功能

### 权限控制测试
- [ ] 未登录用户访问 `/admin` 重定向到登录页
- [ ] 普通用户无法访问管理后台
- [ ] 管理员可以访问所有管理页面

### 提示词管理测试
- [ ] 创建新提示词
- [ ] 编辑现有提示词
- [ ] 删除提示词
- [ ] 标签关联
- [ ] 公开/私密状态切换

### 搜索和筛选测试
- [ ] 文本搜索功能
- [ ] 标签筛选
- [ ] 组合搜索和筛选
- [ ] 搜索结果排序

### 复制功能测试
- [ ] 一键复制提示词内容
- [ ] 复制成功提示显示
- [ ] 复制次数统计

### 管理后台测试
- [ ] 用户管理页面
- [ ] 标签管理页面
- [ ] 系统设置页面
- [ ] 提示词管理页面

## 🐛 常见问题排查

### 1. 认证问题
```bash
# 检查环境变量是否正确设置
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 检查 Supabase OAuth 配置
# 访问 Supabase Dashboard > Authentication > Settings
```

### 2. 数据库连接问题
```sql
-- 检查 RLS 策略是否正确
SELECT * FROM pg_policies WHERE tablename = 'prompts';

-- 检查用户权限
SELECT * FROM auth.users;
```

### 3. 前端错误
- 检查浏览器控制台错误
- 检查网络请求状态
- 检查环境变量是否正确加载

## 📊 性能测试

### 1. 页面加载性能
- 使用 Lighthouse 测试首页性能
- 检查 Core Web Vitals 指标
- 验证图片优化

### 2. 数据库查询性能
```sql
-- 检查慢查询
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- 检查表大小
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔒 安全测试

### 1. 输入验证测试
- 测试 XSS 攻击防护
- 测试 SQL 注入防护
- 测试文件上传安全（如果有）

### 2. 权限测试
- 测试越权访问
- 测试 API 端点保护
- 测试 RLS 策略效果

## 📱 浏览器兼容性测试

### 推荐测试浏览器
- ✅ Chrome (最新版本)
- ✅ Firefox (最新版本)
- ✅ Safari (最新版本)
- ✅ Edge (最新版本)

### 移动端测试
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ 响应式布局测试

## 🚀 部署前检查清单

### 代码质量
- [ ] 所有 ESLint 错误已修复
- [ ] TypeScript 类型检查通过
- [ ] 没有调试代码
- [ ] 环境变量配置正确

### 功能完整性
- [ ] 所有核心功能正常工作
- [ ] 错误处理完善
- [ ] 加载状态正确显示
- [ ] 用户反馈及时

### 性能优化
- [ ] 图片已优化
- [ ] 代码分割正确
- [ ] 缓存策略合适
- [ ] SEO 设置正确

## 📝 测试报告模板

### 测试环境
- 操作系统:
- 浏览器版本:
- Node.js 版本:
- 测试时间:

### 测试结果
- 通过的测试:
- 失败的测试:
- 阻塞性问题:
- 非阻塞性问题:

### 建议改进
1.
2.
3.

---

**重要提醒**:
- 在测试前请确保 Supabase 项目已正确配置
- 所有 OAuth 回调 URL 必须指向 `http://localhost:30001/auth/callback`
- 生产环境部署前请务必进行完整的安全测试