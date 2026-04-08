// 本地 PostgreSQL 数据库连接（仅服务器端使用）
// 此文件只能在服务器端使用，不能被客户端组件导入

let pool: any = null

async function getPool() {
  if (!pool) {
    const { Pool } = await import('pg')
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'promptlib',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'promptlib123',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}

// 查询执行器
export async function query<T = any>(text: string, params?: any[]): Promise<{ data: T[]; error: null } | { data: null; error: any }> {
  try {
    const p = await getPool()
    const result = await p.query(text, params)
    return { data: result.rows as T[], error: null }
  } catch (error) {
    console.error('Database query error:', error)
    return { data: null, error }
  }
}

// 单行查询
export async function queryOne<T = any>(text: string, params?: any[]): Promise<{ data: T | null; error: any | null }> {
  try {
    const p = await getPool()
    const result = await p.query(text, params)
    return { data: result.rows[0] as T || null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// 关闭连接池
export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
