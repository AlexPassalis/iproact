import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { zodInputValue } from '@/lib/postgres/data/zod'
import { postgres } from '@/lib/postgres'
import { activity, output, allocation } from '@/lib/postgres/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { error, data: validatedBody } = z
    .object({
      input: zodInputValue,
      form_submission: z.number(),
    })
    .safeParse(await req.json())
  if (error) {
    return NextResponse.json(
      { error: error.issues.toString() },
      { status: 400 },
    )
  }
  const { input, form_submission } = validatedBody

  let response
  try {
    const array = await postgres
      .select()
      .from(activity)
      .where(
        eq(
          input === 'Recent activity'
            ? activity.recent_activity_used
            : activity.no_recent_activity_used,
          false,
        ),
      )
      .orderBy(activity.id)
      .limit(1)

    if (array.length !== 1) {
      response = 0
    } else {
      const resolved = await Promise.all([
        postgres
          .update(activity)
          .set(
            input === 'Recent activity'
              ? { recent_activity_used: true }
              : { no_recent_activity_used: true },
          )
          .where(eq(activity.id, array[0].id)),
        postgres
          .select()
          .from(allocation)
          .where(
            array[0].recent_activity === 'IPA'
              ? eq(allocation.ipa_used, false)
              : eq(allocation.placebo_used, false),
          )
          .orderBy(allocation.id)
          .limit(1),
      ])

      if (resolved[1].length !== 1) {
        response = 0
      } else {
        response =
          array[0].recent_activity === 'IPA'
            ? resolved[1][0].ipa
            : resolved[1][0].placebo

        await postgres
          .update(allocation)
          .set(
            array[0].recent_activity === 'IPA'
              ? { ipa_used: true }
              : { placebo_used: true },
          )
          .where(eq(allocation.id, resolved[1][0].id))
      }
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error }, { status: 500 })
  }

  if (response !== 0) {
    try {
      await postgres.insert(output).values({
        form_submission: form_submission,
        input: input,
        allocation: response,
      })
    } catch (error) {
      console.error(error)
      return NextResponse.json({ error: error }, { status: 500 })
    }
  }

  return NextResponse.json({ allocation: response }, { status: 200 })
}
