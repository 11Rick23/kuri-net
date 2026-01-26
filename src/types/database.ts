import type {
	credentials,
	sessions,
	users,
	webAuthnChallenges,
} from "@/database/schema";

export type User = typeof users.$inferSelect;
export type Credential = typeof credentials.$inferSelect;
export type WebAuthnChallenge = typeof webAuthnChallenges.$inferSelect;
export type Session = typeof sessions.$inferSelect;
