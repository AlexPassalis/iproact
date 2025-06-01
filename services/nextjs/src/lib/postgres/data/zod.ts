import { z } from 'zod'

export const zodInputValue = z.enum(['Recent activity', 'No recent activity'])
export const zodActivityValue = z.enum(['IPA', 'Placebo'])
export const zodOutputValue = z.number()

export const zodActivityN8N = z.array(
  z.object({
    recent_activity: zodActivityValue,
    no_recent_activity: zodActivityValue,
  }),
)

export const zodOutputN8N = z.array(
  z.object({
    ipa: zodOutputValue,
    placebo: zodOutputValue,
  }),
)
