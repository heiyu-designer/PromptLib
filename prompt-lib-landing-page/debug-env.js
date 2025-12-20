// 调试环境变量加载
console.log('=== Environment Variables Debug ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_KEY);
console.log('NEXT_PUBLIC_SUPABASE_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_KEY?.length || 0);
console.log('NEXT_PUBLIC_SUPABASE_KEY prefix:', process.env.NEXT_PUBLIC_SUPABASE_KEY?.substring(0, 20) + '...');

// 测试是否是占位符文本
if (process.env.NEXT_PUBLIC_SUPABASE_KEY?.includes('your-key-here')) {
  console.error('❌ ERROR: 仍然使用占位符文本！');
} else if (process.env.NEXT_PUBLIC_SUPABASE_KEY?.startsWith('sb_publishable_')) {
  console.log('✅ API key format looks correct (Supabase v3 format)');
} else {
  console.error('❌ ERROR: Invalid API key format');
}