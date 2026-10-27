UPDATE "users"
SET
	"name" = '名無し',
	"profile_completed" = true,
	"updated_at" = now()
WHERE
	"is_anonymous" = false
	AND "profile_completed" = false;
