import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { Pool } from 'pg'
import { envServer } from '../../data/env/envServer'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema/index'
import { sql } from 'drizzle-orm'

async function establishPostgres() {
  const postgresPool = new Pool({
    connectionString: envServer.POSTGRES_URL,
    ssl: false,
  })
  postgresPool.once('SIGINT', () => {
    postgresPool.end()
    console.info('Postgres connection closed.')
  })
  postgresPool.once('SIGTERM', () => {
    postgresPool.end()
    console.info('Postgres connection closed.')
  })

  const postgres = drizzle(postgresPool, { schema })
  try {
    await postgres.execute(sql`SELECT 1`)
    console.info('Postgres connected successfully.')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }

  return postgres
}

export const postgres = envServer.IS_NOT_BUILD_TIME
  ? await establishPostgres()
  : ({} as NodePgDatabase<typeof schema> & { $client: Pool })
