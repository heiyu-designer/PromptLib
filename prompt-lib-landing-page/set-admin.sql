-- 设置用户为管理员
-- 请将 your-email@example.com 替换为你的GitHub登录邮箱

UPDATE profiles
SET role = 'admin', status = 'active'
WHERE email = 'your-email@example.com';

-- 查看当前用户信息
SELECT id, username, email, role, status FROM profiles;