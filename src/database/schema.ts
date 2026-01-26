import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { bytea } from "@/types/drizzle";

export const userStatus = pgEnum("user_status", [
	"REGISTERING",
	"ACTIVE",
	"SUSPENDED",
]);

export const users = pgTable("users", {
	id: text("id").notNull().primaryKey(),
	status: userStatus("status").notNull().default("REGISTERING"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const credentials = pgTable("credentials", {
	id: text("id").notNull().primaryKey(),
	publicKey: bytea("public_key").notNull(),
	userID: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
	counter: integer("counter").notNull().default(0),
	lastUsed: timestamp("last_used", { withTimezone: true }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const webAuthnChallenges = pgTable("webauthn_challenges", {
	sessionID: text("session_id")
		.primaryKey()
		.references(() => sessions.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	userID: text("user_id")
		.references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
	challenge: text("challenge").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	userID: text("user_id").references(() => users.id, {
		onDelete: "cascade",
		onUpdate: "cascade",
	}),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
