-- PromptLib 数据库初始化脚本
-- 适用于 PostgreSQL 15+

-- 创建表结构
-- 1. 用户表 (profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    username TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    must_change_password BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. 标签表 (tags)
CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. 提示词表 (prompts)
CREATE TABLE IF NOT EXISTS prompts (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT true,
    author_id UUID REFERENCES profiles(id),
    view_count BIGINT DEFAULT 0,
    copy_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. 提示词-标签关联表 (prompt_tags)
CREATE TABLE IF NOT EXISTS prompt_tags (
    prompt_id BIGINT REFERENCES prompts(id) ON DELETE CASCADE,
    tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (prompt_id, tag_id)
);

-- 5. 复制事件表 (copy_events)
CREATE TABLE IF NOT EXISTS copy_events (
    id BIGSERIAL PRIMARY KEY,
    prompt_id BIGINT REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. 站点设置表 (settings)
CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_prompts_author ON prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_tags_tag_id ON prompt_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_copy_events_prompt ON copy_events(prompt_id);
CREATE INDEX IF NOT EXISTS idx_copy_events_created ON copy_events(created_at);

-- 导入数据 (从 CSV 文件)
-- 使用 \COPY 命令（需要 psql 客户端）

-- 导入标签
\COPY tags(id, name, slug, color, created_at) FROM '/data/tags.csv' CSV HEADER;

-- 导入用户
\COPY profiles(id, username, avatar_url, role, status, must_change_password, created_at) FROM '/data/profiles.csv' CSV HEADER;

-- 导入提示词
\COPY prompts(id, title, description, content, cover_image_url, is_public, author_id, view_count, copy_count, created_at) FROM '/data/prompts.csv' CSV HEADER;

-- 导入关联表
\COPY prompt_tags(prompt_id, tag_id) FROM '/data/prompt_tags.csv' CSV HEADER;

-- 导入复制事件
\COPY copy_events(id, prompt_id, user_id, ip_address, created_at) FROM '/data/copy_events.csv' CSV HEADER;

-- 重置序列
SELECT setval('tags_id_seq', (SELECT MAX(id) FROM tags));
SELECT setval('prompts_id_seq', (SELECT MAX(id) FROM prompts));
SELECT setval('copy_events_id_seq', (SELECT MAX(id) FROM copy_events));

-- 验证数据
SELECT 'tags' as table_name, COUNT(*) as count FROM tags
UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL SELECT 'prompts', COUNT(*) FROM prompts
UNION ALL SELECT 'prompt_tags', COUNT(*) FROM prompt_tags
UNION ALL SELECT 'copy_events', COUNT(*) FROM copy_events;
