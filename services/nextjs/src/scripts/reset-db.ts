import { postgres } from '../lib/postgres'
import { activity, allocation, output } from '../lib/postgres/schema/index'

async function reset() {
  await Promise.all([
    postgres.update(activity).set({
      recent_activity_used: false,
      no_recent_activity_used: false,
    }),
    postgres.update(allocation).set({
      ipa_used: false,
      placebo_used: false,
    }),
    postgres.delete(output),
  ])

  console.log('Database reset to post-seed state.')
  process.exit(0)
}

reset().catch((err) => {
  console.error('Reset failed:', err)
  process.exit(1)
})
