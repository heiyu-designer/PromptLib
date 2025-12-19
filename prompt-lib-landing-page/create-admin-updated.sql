-- 更新的管理员创建方法

-- 1. 检查 auth.users 表的实际结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 2. 尝试使用 Supabase Auth 的内置注册功能
-- 这是最简单的方法：直接通过 Web 界面注册第一个用户

-- 3. 或者使用 auth.sign_up 函数（如果存在）
-- SELECT auth.sign_up('admin@example.com', 'admin123456') as sign_up_result;

-- 4. 最简单的方法：先创建一个手动记录，然后通过网站激活
INSERT INTO profiles (id, username, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid, -- 这个将在用户注册时更新
  'admin',
  'admin',
  now()
) ON CONFLICT (id) DO NOTHING;

-- 5. 测试数据库连接是否现在工作
SELECT 'Testing database connection...' as status;

-- 6. 验证标签数据是否可访问
SELECT 'Tags count:' as info, COUNT(*) as count FROM tags;
SELECT id, name, slug, color FROM tags ORDER BY id LIMIT 10;