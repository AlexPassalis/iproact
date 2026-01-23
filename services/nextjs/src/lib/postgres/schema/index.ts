import type {
  typeActivityValue,
  typeOutputValue,
  typeInputValue,
} from '../data/type'

import { pgTable, serial, text, boolean, integer } from 'drizzle-orm/pg-core'

export const activity = pgTable('activity', {
  id: serial('id').primaryKey(),
  recent_activity: text('recent_activity').$type<typeActivityValue>().notNull(),
  recent_activity_used: boolean('recent_activity_used')
    .notNull()
    .default(false),
  no_recent_activity: text('no_recent_activity')
    .$type<typeActivityValue>()
    .notNull(),
  no_recent_activity_used: boolean('no_recent_activity_used')
    .notNull()
    .default(false),
})

export const allocation = pgTable('allocation', {
  id: serial('id').primaryKey(),
  ipa: text('ipa').$type<typeOutputValue>().notNull(),
  ipa_used: boolean('ipa_used').notNull().default(false),
  placebo: text('placebo').$type<typeOutputValue>().notNull(),
  placebo_used: boolean('placebo_used').notNull().default(false),
})

export const output = pgTable('output', {
  form_submission: integer('form_submission').primaryKey(),
  input: text('input').$type<typeInputValue>().notNull(),
  allocation: text('allocation').$type<typeOutputValue>().notNull(),
})
