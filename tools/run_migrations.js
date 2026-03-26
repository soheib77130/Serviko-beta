const fs = require('fs')
const { Client } = require('pg')

async function run() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL not set')
    process.exit(1)
  }

  const sql = fs.readFileSync('supabase/migrations/001_init.sql', 'utf8')
  const client = new Client({ connectionString })
  try {
    await client.connect()
    console.log('Connected to DB — executing migration...')
    await client.query(sql)
    console.log('Migration executed successfully')
  } catch (err) {
    console.error('Migration error:', err.message)
    process.exit(2)
  } finally {
    await client.end()
  }
}

run()
