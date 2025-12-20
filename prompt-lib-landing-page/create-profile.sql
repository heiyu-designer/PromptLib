-- 手动创建用户profile
-- 请根据实际情况修改以下信息

-- 首先查看auth.users表中是否有你的用户数据
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 如果找到了你的用户，使用用户ID创建profile
-- 将 the-user-id 替换为上面查询中找到的用户ID

INSERT INTO profiles (
  id,
  username,
  email,
  avatar_url,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  'the-user-id',  -- 替换为真实的用户ID
  'admin',        -- 用户名
  'your-email@example.com',  -- 替换为你的邮箱
  NULL,           -- 头像URL（可选）
  'admin',        -- 设置为管理员
  'active',       -- 状态
  NOW(),          -- 创建时间
  NOW()           -- 更新时间
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'active',
  updated_at = NOW();