import { postgres } from '@/lib/postgres'
import { history, activity, output } from '@/lib/postgres/schema'
import { NextResponse } from 'next/server'
import { desc, eq, or } from 'drizzle-orm'
import axios from 'axios'
import { envServer } from '@/data/env/envServer'

export async function DELETE() {
  try {
    const [historyRow] = await postgres
      .select()
      .from(history)
      .orderBy(desc(history.form_submission))
      .limit(1)

    const resolved = await Promise.all([
      axios.delete(
        `${envServer.N8N_WEBHOOK_URL}/submit?form_submission=${historyRow.form_submission}`,
      ),
      postgres
        .delete(history)
        .where(eq(history.form_submission, historyRow.form_submission)),
      postgres
        .select()
        .from(activity)
        .where(
          historyRow.input === 'Recent activity'
            ? eq(activity.recent_activity_used, true)
            : eq(activity.no_recent_activity_used, true),
        )
        .orderBy(desc(activity.id))
        .limit(1),
      postgres
        .select()
        .from(output)
        .where(
          or(
            eq(output.ipa, historyRow.output),
            eq(output.placebo, historyRow.output),
          ),
        )
        .orderBy(desc(output.id))
        .limit(1),
    ])

    await Promise.all([
      postgres
        .update(activity)
        .set(
          historyRow.input === 'Recent activity'
            ? { recent_activity_used: false }
            : { no_recent_activity_used: false },
        )
        .where(eq(activity.id, resolved[2][0].id)),
      postgres
        .update(output)
        .set(
          historyRow.output === resolved[3][0].ipa
            ? { ipa_used: false }
            : { placebo_used: false },
        )
        .where(eq(output.id, resolved[3][0].id)),
    ])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error }, { status: 500 })
  }

  return NextResponse.json(null, { status: 200 })
}
