-- 手动创建用户profile（修正版）
-- profiles表结构：id, username, avatar_url, role, status, must_change_password, created_at

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
  avatar_url,
  role,
  status,
  must_change_password,
  created_at
) VALUES (
  'the-user-id',     -- 替换为真实的用户ID
  'admin',           -- 用户名
  NULL,              -- 头像URL（可选）
  'admin',           -- 设置为管理员
  'active',          -- 状态
  false,             -- 是否需要修改密码
  NOW()              -- 创建时间
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'active',
  username = 'admin',
  updated_at = NOW();

-- 验证创建结果
SELECT * FROM profiles WHERE id = 'the-user-id';