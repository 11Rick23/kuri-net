import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: text("id").notNull().primaryKey(),
	email: text("email").notNull().unique(),
	displayName: text("display_name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const credentials = pgTable("credentials", {
	id: text("id").notNull().primaryKey(),
	aaguid: text("aaguid"),
	publicKey: text("public_key").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
	counter: integer("counter").notNull().default(0),
	lastUsed: timestamp("last_used", { withTimezone: true }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const challenges = pgTable("challenges", {
	challenge: varchar("challenge", {length: 43}).notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	userId: text("user_id").notNull().primaryKey(),
});
