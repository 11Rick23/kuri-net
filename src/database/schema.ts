import {
	bigint,
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { bytea } from "@/types/drizzle";

export const userStatus = pgEnum("user_status", [
	"REGISTERING",
	"ACTIVE",
	"SUSPENDED",
]);

export const users = pgTable("users", {
	id: text("id").notNull().primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	status: userStatus("status").notNull().default("REGISTERING"),
	isAnonymous: boolean("is_anonymous").notNull().default(false),
	profileCompleted: boolean("profile_completed").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const authSessions = pgTable(
	"auth_sessions",
	{
		id: text("id").notNull().primaryKey(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		token: text("token").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [
		uniqueIndex("auth_sessions_token_unique").on(table.token),
		index("auth_sessions_user_id_idx").on(table.userId),
	],
);

export const authAccounts = pgTable(
	"auth_accounts",
	{
		id: text("id").notNull().primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at", {
			withTimezone: true,
		}),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
			withTimezone: true,
		}),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [index("auth_accounts_user_id_idx").on(table.userId)],
);

export const authVerifications = pgTable(
	"auth_verifications",
	{
		id: text("id").notNull().primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [index("auth_verifications_identifier_idx").on(table.identifier)],
);

export const authPasskeys = pgTable(
	"auth_passkeys",
	{
		id: text("id").notNull().primaryKey(),
		name: text("name"),
		publicKey: text("public_key").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		credentialID: text("credential_id").notNull(),
		counter: integer("counter").notNull(),
		deviceType: text("device_type").notNull(),
		backedUp: boolean("backed_up").notNull(),
		transports: text("transports"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		aaguid: text("aaguid"),
	},
	(table) => [
		index("auth_passkeys_user_id_idx").on(table.userId),
		uniqueIndex("auth_passkeys_credential_id_unique").on(table.credentialID),
	],
);

export const authRateLimits = pgTable(
	"auth_rate_limits",
	{
		id: text("id").notNull().primaryKey(),
		key: text("key").notNull(),
		count: integer("count").notNull(),
		lastRequest: bigint("last_request", { mode: "number" }).notNull(),
	},
	(table) => [uniqueIndex("auth_rate_limits_key_unique").on(table.key)],
);

export const notepads = pgTable("notepads", {
	userID: text("user_id")
		.notNull()
		.primaryKey()
		.references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
	content: text("content").notNull().default(""),
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
	userID: text("user_id").references(() => users.id, {
		onDelete: "cascade",
		onUpdate: "cascade",
	}),
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
