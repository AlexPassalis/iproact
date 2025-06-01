import { readSecret } from './src/utils/readSecret'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: readSecret('IPROACT_POSTGRES_URL'),
  },
  schemaFilter: ['public'],
  schema: './src/lib/postgres/schema/index.ts',
  out: './src/lib/postgres/migrations',
  verbose: true,
  strict: true,
})
