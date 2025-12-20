# GitHub OAuth 设置指南

## 问题分析

从OAuth URL中发现两个不同的redirect参数：
- `redirect_to=http%3A%2F%2Flocalhost%3A30001%2Fauth%2Fcallback`
- `redirect_uri=https%3A%2F%2Fupoplrsvarlwhkqknbnq.supabase.co%2Fauth%2Fv1%2Fcallback`

这造成了回调冲突。

## 正确的OAuth流程

1. 用户点击"GitHub登录"
2. 跳转到GitHub授权页面
3. 用户授权后，GitHub重定向到Supabase的OAuth回调URL
4. Supabase处理授权并重定向回我们的应用

## 需要检查的配置

### 1. GitHub OAuth App设置
- **Homepage URL**: `http://localhost:30001`
- **Authorization callback URL**: `https://upoplrsvarlwhkqknbnq.supabase.co/auth/v1/callback`

### 2. Supabase设置
- **Site URL**: `http://localhost:30001`
- **Redirect URLs**: `http://localhost:30001/**`
- **GitHub Provider**: 确保Client ID和Client Secret正确

### 3. 应用配置
- 移除手动设置的redirectTo，让Supabase自动处理
- 使用默认的OAuth流程

## 验证步骤

1. 检查Supabase Dashboard > Authentication > URL Configuration
2. 确认GitHub Provider配置正确
3. 测试OAuth流程

## 常见错误

1. **redirect_uri_mismatch**: GitHub回调URL不匹配
2. **Provider token is missing**: Client Secret配置错误
3. **重复redirect参数**: 代码中手动设置了错误的回调URL