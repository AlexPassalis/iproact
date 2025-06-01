export const dynamic = 'force-dynamic'

import { postgres } from '@/lib/postgres'
import { history } from '@/lib/postgres/schema'
import { HomeClient } from '@/app/client'
import { desc } from 'drizzle-orm'

export default async function Home() {
  let postgres_history
  try {
    postgres_history = await postgres
      .select()
      .from(history)
      .orderBy(desc(history.form_submission))
  } catch (error) {
    console.error(error)
    throw error
  }

  return <HomeClient postgres_history={postgres_history} />
}
