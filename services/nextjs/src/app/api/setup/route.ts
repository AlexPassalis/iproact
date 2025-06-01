import { postgres } from '@/lib/postgres'
import { activity, output } from '@/lib/postgres/schema/index'
import { zodActivityN8N, zodOutputN8N } from '@/lib/postgres/data/zod'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const resolved = await Promise.all([
      postgres.select().from(activity),
      postgres.select().from(output),
    ])

    if (resolved[0].length > 0 || resolved[1].length > 0) {
      return NextResponse.json(
        { error: 'db has already been setup' },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error }, { status: 500 })
  }

  const { error, data: validatedBody } = z
    .object({
      activity: zodActivityN8N,
      output: zodOutputN8N,
    })
    .safeParse(await req.json())
  if (error) {
    console.error(error.issues)
    return NextResponse.json(
      { error: error.issues.toString() },
      { status: 400 },
    )
  }
  const { activity: n8nActivity, output: n8nOutput } = validatedBody

  try {
    await Promise.all([
      postgres.insert(activity).values(n8nActivity),
      postgres.insert(output).values(n8nOutput),
    ])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error }, { status: 500 })
  }

  return NextResponse.json(
    { message: 'setup completed successfully' },
    { status: 200 },
  )
}
