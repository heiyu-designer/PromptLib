-- 简化版本的profile创建SQL
-- 先检查表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public';

-- 然后创建记录（如果表存在）
INSERT INTO profiles (
  id,
  username,
  avatar_url,
  role,
  status,
  must_change_password,
  created_at
) VALUES (
  'daa1ed3a-82ea-4838-8a3f-b3e9fc2f1bc9',
  'heiyu-designer',
  NULL,
  'admin',
  'active',
  false,
  CURRENT_TIMESTAMP
);