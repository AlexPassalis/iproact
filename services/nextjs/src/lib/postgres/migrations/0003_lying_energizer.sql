CREATE TABLE "output" (
	"id" serial PRIMARY KEY NOT NULL,
	"ipa" text NOT NULL,
	"ipa_used" boolean DEFAULT false NOT NULL,
	"placebo" text NOT NULL,
	"placebo_used" boolean DEFAULT false NOT NULL
);
