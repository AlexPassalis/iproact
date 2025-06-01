ALTER TABLE "activity" ALTER COLUMN "recent_activity" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "activity" ALTER COLUMN "no_recent_activity" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "recent_activity_used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "activity" ADD COLUMN "no_recent_activity_used" boolean DEFAULT false NOT NULL;