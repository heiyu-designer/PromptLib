-- 重新创建管理员用户函数
-- 注意：需要先删除已存在的函数（如果存在）

-- 删除已存在的函数
DROP FUNCTION IF EXISTS create_admin_user(text, text, text);

-- 重新创建函数
CREATE OR REPLACE FUNCTION create_admin_user(email text, password text, username text)
RETURNS void AS $$
DECLARE
  user_id uuid;
BEGIN
  -- 创建用户
  INSERT INTO auth.users (email, password, email_confirmed_at)
  VALUES (email, password, now())
  RETURNING id INTO user_id;

  -- 创建管理员配置文件
  INSERT INTO profiles (id, username, role)
  VALUES (user_id, username, 'admin');

  -- 记录成功创建
  RAISE NOTICE 'Admin user created successfully: %', email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 验证函数是否创建成功
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'create_admin_user' AND routine_schema = 'public';