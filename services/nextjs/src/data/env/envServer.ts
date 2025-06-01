import 'dotenv/config'
import { z } from 'zod'
import { readSecret } from '../../utils/readSecret'

const envSchema = z.object({
  IS_NOT_BUILD_TIME: z.boolean(),
  POSTGRES_URL: z.string().url(),
  N8N_WEBHOOK_URL: z.string().url(),
})

const { error, data } = envSchema.safeParse({
  IS_NOT_BUILD_TIME: process.env.IS_BUILD_TIME !== 'true',
  POSTGRES_URL: readSecret('IPROACT_POSTGRES_URL'),
  N8N_WEBHOOK_URL: `http://stack-iproact_n8n:5678/${
    process.env.NODE_ENV === 'development' ? 'webhook-test' : 'webhook'
  }`,
})

if (error) {
  console.error('Invalid env variables :')
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2))
  process.exit(1)
}

export const envServer = data
