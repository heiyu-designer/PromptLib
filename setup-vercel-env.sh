#!/bin/bash

# Vercel 环境变量设置脚本
echo "🔧 配置 Vercel 环境变量..."

echo ""
echo "请从您的 Supabase 项目设置中获取以下信息："
echo "1. Project URL"
echo "2. API Key (anon public)"
echo "3. Service Role Key"
echo ""
echo "访问: https://supabase.com/dashboard/project/your-project-id/settings/api"
echo ""

# 设置 Supabase URL
echo "设置 NEXT_PUBLIC_SUPABASE_URL:"
read -p "请输入 Supabase Project URL: " supabase_url
vercel env add NEXT_PUBLIC_SUPABASE_URL --value "$supabase_url"

# 设置 Supabase 匿名密钥
echo ""
echo "设置 NEXT_PUBLIC_SUPABASE_KEY:"
read -p "请输入 Supabase API Key (anon public): " supabase_key
vercel env add NEXT_PUBLIC_SUPABASE_KEY --value "$supabase_key"

# 设置 Supabase 服务角色密钥
echo ""
echo "设置 SUPABASE_SERVICE_ROLE_KEY:"
read -p "请输入 Supabase Service Role Key: " service_role_key
vercel env add SUPABASE_SERVICE_ROLE_KEY --value "$service_role_key"

# 设置 NextAuth URL（可选）
echo ""
echo "设置 NEXTAUTH_URL (可选):"
read -p "请输入 NextAuth URL (例如: https://prompt-lib-amber.vercel.app): " nextauth_url
if [ ! -z "$nextauth_url" ]; then
    vercel env add NEXTAUTH_URL --value "$nextauth_url"
fi

# 设置 NextAuth Secret（可选）
echo ""
echo "设置 NEXTAUTH_SECRET (可选):"
read -p "请输入 NextAuth Secret (留空跳过): " nextauth_secret
if [ ! -z "$nextauth_secret" ]; then
    vercel env add NEXTAUTH_SECRET --value "$nextauth_secret"
fi

echo ""
echo "✅ 环境变量配置完成！"
echo "现在可以运行: vercel --prod --yes"