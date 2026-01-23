CREATE TABLE "activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"recent_activity" text NOT NULL,
	"recent_activity_used" boolean DEFAULT false NOT NULL,
	"no_recent_activity" text NOT NULL,
	"no_recent_activity_used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "allocation" (
	"id" serial PRIMARY KEY NOT NULL,
	"ipa" text NOT NULL,
	"ipa_used" boolean DEFAULT false NOT NULL,
	"placebo" text NOT NULL,
	"placebo_used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "output" (
	"form_submission" integer PRIMARY KEY NOT NULL,
	"input" text NOT NULL,
	"allocation" text NOT NULL
);
