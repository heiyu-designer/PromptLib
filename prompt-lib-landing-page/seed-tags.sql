-- 插入示例标签数据
INSERT INTO tags (name, slug, color, created_at) VALUES
('编程', 'programming', '#3b82f6', NOW()),
('写作', 'writing', '#22c55e', NOW()),
('ChatGPT', 'chatgpt', '#10a37f', NOW()),
('Claude', 'claude', '#f59e0b', NOW()),
('Midjourney', 'midjourney', '#8b5cf6', NOW()),
('自动化', 'automation', '#ef4444', NOW()),
('数据分析', 'data-analysis', '#06b6d4', NOW()),
('营销', 'marketing', '#ec4899', NOW()),
('教育', 'education', '#84cc16', NOW()),
('设计', 'design', '#f97316', NOW())
ON CONFLICT (slug) DO NOTHING;