import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const Pool = pg.Pool

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'reserve_meetingroom'
})

export default pool
