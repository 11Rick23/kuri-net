import type {
	credentials,
	notepads,
	sessions,
	users,
	webAuthnChallenges,
} from "@/database/schema";

export type User = typeof users.$inferSelect;
export type Notepad = typeof notepads.$inferSelect;
export type Credential = typeof credentials.$inferSelect;
export type WebAuthnChallenge = typeof webAuthnChallenges.$inferSelect;
export type Session = typeof sessions.$inferSelect;
