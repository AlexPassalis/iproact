import { postgres } from '@/lib/postgres'
import { history, activity, output } from '@/lib/postgres/schema'
import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import axios from 'axios'
import { envServer } from '@/data/env/envServer'

export async function DELETE() {
  try {
    const [historyRow] = await postgres
      .select()
      .from(history)
      .orderBy(desc(history.form_submission))
      .limit(1)

    const firstResolved = await Promise.all([
      postgres
        .delete(history)
        .where(eq(history.form_submission, historyRow.form_submission)),
      axios.delete(
        `${envServer.N8N_WEBHOOK_URL}/submit?form_submission=${historyRow.form_submission}`,
      ),
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
    ])

    const activityRow = firstResolved[2][0]
    const secondResolved = await Promise.all([
      postgres
        .update(activity)
        .set(
          historyRow.input === 'Recent activity'
            ? { recent_activity_used: false }
            : { no_recent_activity_used: false },
        )
        .where(eq(activity.id, activityRow.id)),
      postgres
        .select()
        .from(output)
        .where(
          historyRow.input === 'Recent activity'
            ? activityRow.recent_activity === 'IPA'
              ? eq(output.ipa_used, true)
              : eq(output.placebo_used, true)
            : activityRow.no_recent_activity === 'IPA'
            ? eq(output.ipa_used, true)
            : eq(output.placebo_used, true),
        )
        .orderBy(desc(output.id))
        .limit(1),
    ])

    const outputRow = secondResolved[1][0]
    await postgres
      .update(output)
      .set(
        historyRow.input === 'Recent activity'
          ? activityRow.recent_activity === 'IPA'
            ? { ipa_used: false }
            : { placebo_used: false }
          : activityRow.no_recent_activity === 'IPA'
          ? { ipa_used: false }
          : { placebo_used: false },
      )
      .where(eq(output.id, outputRow.id))
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error }, { status: 500 })
  }

  return NextResponse.json(null, { status: 200 })
}
