-- 暂时完全禁用RLS策略，让应用先工作起来

-- 1. 禁用所有表的RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompts DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE copy_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- 2. 创建管理员用户（简化版，不需要RLS）
CREATE OR REPLACE FUNCTION create_admin_user_simple(email text, password text, username text)
RETURNS void AS $$
DECLARE
  user_id uuid;
BEGIN
  -- 创建用户账户
  INSERT INTO auth.users (email, password, email_confirmed_at)
  VALUES (email, password, now())
  RETURNING id INTO user_id;

  -- 创建管理员配置文件
  INSERT INTO profiles (id, username, role, created_at)
  VALUES (user_id, username, 'admin', now());

  RAISE NOTICE 'Admin user created successfully: %', email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 测试表是否可以正常访问
SELECT 'RLS disabled - database should work now!' as status;

-- 4. 验证初始数据
SELECT 'Tags count:' as info, COUNT(*) as count FROM tags;
SELECT 'Settings count:' as info, COUNT(*) as count FROM settings;