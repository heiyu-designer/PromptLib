#!/bin/bash

# Vercel 部署脚本
# AI Prompt Library - Vercel Deployment Script

echo "🚀 开始 AI Prompt Library Vercel 部署..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在 prompt-lib-landing-page 目录中运行此脚本"
    exit 1
fi

# 检查 Vercel CLI 是否已安装
if ! command -v vercel &> /dev/null; then
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录 Vercel
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "🌐 请先登录 Vercel："
    echo "1. 运行: vercel login"
    echo "2. 在浏览器中完成认证"
    echo "3. 重新运行此脚本"
    exit 1
fi

echo "✅ Vercel 登录状态确认"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "⚠️  警告：未找到 .env.local 文件"
    echo "📝 请确保在 Vercel 中配置了以下环境变量："
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo ""
echo "🚀 准备部署到 Vercel..."
echo ""
echo "选择部署环境："
echo "1. 预览环境 (Preview)"
echo "2. 生产环境 (Production)"
read -p "请选择 (1 或 2): " choice

case $choice in
    1)
        echo "🔍 部署到预览环境..."
        vercel
        ;;
    2)
        echo "🏭 部署到生产环境..."
        vercel --prod
        ;;
    *)
        echo "❌ 无效选择，默认部署到预览环境"
        vercel
        ;;
esac

echo ""
echo "🎉 部署完成！"
echo "📊 您可以在 Vercel Dashboard 中查看部署状态"
echo "🔗 访问 Vercel Dashboard: https://vercel.com/dashboard"