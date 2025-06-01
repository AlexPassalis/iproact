import type { z } from 'zod'

import { zodActivityValue, zodOutputValue, zodInputValue } from '../data/zod'

import type { InferSelectModel } from 'drizzle-orm'
import { history } from '../schema'

export type typeActivityValue = z.infer<typeof zodActivityValue>

export type typeOutputValue = z.infer<typeof zodOutputValue>

export type typeInputValue = z.infer<typeof zodInputValue>

export type typeHistory = InferSelectModel<typeof history>[]
