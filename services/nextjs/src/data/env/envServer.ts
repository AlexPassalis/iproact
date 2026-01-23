import 'dotenv/config'
import { z } from 'zod'
import { readSecret } from '../../utils/readSecret'

const envSchema = z.object({
  IS_NOT_BUILD_TIME: z.boolean(),
  POSTGRES_URL: z.string().url(),
  IPROACT: z.string(),
})

const { error, data } = envSchema.safeParse({
  IS_NOT_BUILD_TIME: process.env.IS_BUILD_TIME !== 'true',
  POSTGRES_URL: readSecret('IPROACT_POSTGRES_URL'),
  IPROACT: readSecret('IPROACT'),
})

if (error) {
  console.error('Invalid env variables :')
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2))
  process.exit(1)
}

export const envServer = data
