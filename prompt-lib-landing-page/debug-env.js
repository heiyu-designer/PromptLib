// 调试环境变量加载
console.log('=== Environment Variables Debug ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY prefix:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

// 测试是否是占位符文本
if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('在此处粘贴')) {
  console.error('❌ ERROR: 仍然使用占位符文本！');
} else if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ')) {
  console.log('✅ API key format looks correct (JWT token)');
} else {
  console.error('❌ ERROR: Invalid API key format');
}