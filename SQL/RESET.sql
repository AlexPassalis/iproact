UPDATE activity
SET
  recent_activity_used = false,
  no_recent_activity_used = false;

UPDATE output
SET
  ipa_used = false,
  placebo_used = false;

DELETE FROM history;
