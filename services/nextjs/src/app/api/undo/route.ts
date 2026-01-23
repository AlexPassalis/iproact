import { postgres } from '@/lib/postgres'
import { output, activity, allocation } from '@/lib/postgres/schema'
import { NextResponse } from 'next/server'
import { desc, eq, or } from 'drizzle-orm'

export async function DELETE() {
  try {
    const [outputRow] = await postgres
      .select()
      .from(output)
      .orderBy(desc(output.form_submission))
      .limit(1)

    const resolved = await Promise.all([
      postgres
        .delete(output)
        .where(eq(output.form_submission, outputRow.form_submission)),
      postgres
        .select()
        .from(activity)
        .where(
          outputRow.input === 'Recent activity'
            ? eq(activity.recent_activity_used, true)
            : eq(activity.no_recent_activity_used, true),
        )
        .orderBy(desc(activity.id))
        .limit(1),
      postgres
        .select()
        .from(allocation)
        .where(
          or(
            eq(allocation.ipa, outputRow.allocation),
            eq(allocation.placebo, outputRow.allocation),
          ),
        )
        .orderBy(desc(allocation.id))
        .limit(1),
    ])

    await Promise.all([
      postgres
        .update(activity)
        .set(
          outputRow.input === 'Recent activity'
            ? { recent_activity_used: false }
            : { no_recent_activity_used: false },
        )
        .where(eq(activity.id, resolved[1][0].id)),
      postgres
        .update(allocation)
        .set(
          outputRow.allocation === resolved[2][0].ipa
            ? { ipa_used: false }
            : { placebo_used: false },
        )
        .where(eq(allocation.id, resolved[2][0].id)),
    ])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error }, { status: 500 })
  }

  return NextResponse.json(null, { status: 200 })
}
