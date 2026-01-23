import fs from 'node:fs'
import path from 'node:path'
import { postgres } from '../lib/postgres'
import { activity, allocation } from '../lib/postgres/schema/index'
import { zodActivity, zodAllocation } from '../lib/postgres/data/zod'

function parseCSV(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, 'utf-8').trim()
  const lines = content.split('\n')
  const headers = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]))
  })
}

async function seed() {
  const scriptsDir = path.dirname(new URL(import.meta.url).pathname)
  const activityPath = path.join(scriptsDir, 'activity.csv')
  const allocationPath = path.join(scriptsDir, 'allocation.csv')

  if (!fs.existsSync(activityPath)) {
    console.error(`File not found: ${activityPath}`)
    process.exit(1)
  }
  if (!fs.existsSync(allocationPath)) {
    console.error(`File not found: ${allocationPath}`)
    process.exit(1)
  }

  const activityRows = parseCSV(activityPath).map((row) => ({
    recent_activity: row['Recent activity'],
    no_recent_activity: row['No recent activity'],
  }))
  const allocationRows = parseCSV(allocationPath).map((row) => ({
    ipa: Number(row['IPA']),
    placebo: Number(row['Placebo']),
  }))

  const activityParsed = zodActivity.safeParse(activityRows)
  if (!activityParsed.success) {
    console.error('Invalid activity data:', activityParsed.error.issues)
    process.exit(1)
  }

  const allocationParsed = zodAllocation.safeParse(allocationRows)
  if (!allocationParsed.success) {
    console.error('Invalid allocation data:', allocationParsed.error.issues)
    process.exit(1)
  }

  const activityData = activityParsed.data
  const allocationData = allocationParsed.data

  const [existingActivity, existingAllocation] = await Promise.all([
    postgres.select().from(activity),
    postgres.select().from(allocation),
  ])

  if (existingActivity.length > 0 || existingAllocation.length > 0) {
    console.error('Database tables are not empty. Run SQL/RESET.sql first.')
    process.exit(1)
  }

  await Promise.all([
    postgres.insert(activity).values(activityData),
    postgres.insert(allocation).values(allocationData),
  ])

  console.log(
    `Seeded ${activityData.length} activity rows and ${allocationData.length} allocation rows.`,
  )
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
