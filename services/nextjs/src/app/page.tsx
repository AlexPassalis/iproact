export const dynamic = 'force-dynamic'

import { iProact } from '@/app/iProact'
import { notFound } from 'next/navigation'
import { postgres } from '@/lib/postgres'
import { output } from '@/lib/postgres/schema'
import { HomeClient } from '@/app/client'
import { desc } from 'drizzle-orm'

export default async function Home() {
  const iproact = await iProact()
  if (!iproact) {
    notFound()
  }

  const postgres_output = await postgres
    .select()
    .from(output)
    .orderBy(desc(output.form_submission))

  return <HomeClient postgres_output={postgres_output} />
}
