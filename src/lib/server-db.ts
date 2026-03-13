import { Pool } from 'pg'

// Server-side database connection for Render PostgreSQL
const pool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected database error:', err)
})

export async function queryDatabase(query: string, params: any[] = []) {
  try {
    const result = await pool.query(query, params)
    return result.rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export default pool
