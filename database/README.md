# PromptLib 本地数据库

本地 PostgreSQL 数据库配置，用于 Docker 部署。

## 目录结构

```
database/
├── docker-compose.yml   # Docker Compose 配置
├── init.sql            # 数据库初始化脚本
├── data/               # CSV 数据文件
│   ├── prompts.csv
│   ├── tags.csv
│   ├── profiles.csv
│   ├── prompt_tags.csv
│   └── copy_events.csv
└── README.md
```

## 快速启动

### 1. 启动数据库

```bash
cd database
docker-compose up -d
```

### 2. 等待数据库就绪后，导入数据

```bash
docker exec -i promptlib-db psql -U postgres -d promptlib < init.sql
```

或使用 psql 客户端：

```bash
psql -h localhost -U postgres -d promptlib -f init.sql
```

### 3. 验证数据

```sql
-- 连接数据库
psql -h localhost -U postgres -d promptlib

-- 查看数据量
SELECT 'tags' as table_name, COUNT(*) as count FROM tags
UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL SELECT 'prompts', COUNT(*) FROM prompts
UNION ALL SELECT 'prompt_tags', COUNT(*) FROM prompt_tags
UNION ALL SELECT 'copy_events', COUNT(*) FROM copy_events;
```

## 连接信息

- **主机**: localhost
- **端口**: 5432
- **数据库名**: promptlib
- **用户名**: postgres
- **密码**: promptlib123

## 连接字符串

```
postgresql://postgres:promptlib123@localhost:5432/promptlib
```

## 管理命令

```bash
# 停止数据库
docker-compose down

# 删除数据卷（清空数据）
docker-compose down -v

# 查看日志
docker-compose logs -f db

# 进入数据库容器
docker exec -it promptlib-db psql -U postgres -d promptlib
```

## 数据备份

```bash
# 导出数据
docker exec -i promptlib-db pg_dump -U postgres promptlib > backup.sql

# 导入数据
docker exec -i promptlib-db psql -U postgres -d promptlib < backup.sql
```
