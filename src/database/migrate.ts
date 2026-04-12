import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index";

type Journal = {
	entries: {
		breakpoints: boolean;
		idx: number;
		tag: string;
		version: string;
		when: number;
	}[];
};

async function ensureMigrationsTable() {
	await pool.query('CREATE SCHEMA IF NOT EXISTS "drizzle"');
	await pool.query(`
		CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
			"id" SERIAL PRIMARY KEY,
			"hash" text NOT NULL,
			"created_at" bigint
		)
	`);
}

async function getExistingMigrationCount() {
	const result = await pool.query(
		'SELECT COUNT(*)::int AS count FROM "drizzle"."__drizzle_migrations"',
	);

	return result.rows[0]?.count ?? 0;
}

async function relationExists(kind: "table" | "type", name: string) {
	if (kind === "table") {
		const result = await pool.query(
			"SELECT to_regclass($1) IS NOT NULL AS exists",
			[name],
		);

		return result.rows[0]?.exists === true;
	}

	const result = await pool.query(
		`
			SELECT EXISTS (
				SELECT 1
				FROM pg_type t
				JOIN pg_namespace n ON n.oid = t.typnamespace
				WHERE n.nspname = $1 AND t.typname = $2
			) AS exists
		`,
		["public", name],
	);

	return result.rows[0]?.exists === true;
}

async function detectBootstrapTags() {
	const migration0000Checks = await Promise.all([
		relationExists("type", "user_status"),
		relationExists("table", "public.credentials"),
		relationExists("table", "public.sessions"),
		relationExists("table", "public.users"),
		relationExists("table", "public.webauthn_challenges"),
	]);

	const migration0000Applied = migration0000Checks.every(Boolean);
	const migration0000Missing = migration0000Checks.every((value) => !value);

	if (!migration0000Applied && !migration0000Missing) {
		throw new Error(
			"Database is partially initialized for migration 0000_shiny_thunderball. Refusing to auto-bootstrap migration history.",
		);
	}

	if (!migration0000Applied) {
		return [];
	}

	const notepadsExists = await relationExists("table", "public.notepads");

	return notepadsExists
		? ["0000_shiny_thunderball", "0001_small_notepad"]
		: ["0000_shiny_thunderball"];
}

function readJournal(migrationsFolder: string) {
	const journalPath = resolve(migrationsFolder, "meta", "_journal.json");

	return JSON.parse(readFileSync(journalPath, "utf8")) as Journal;
}

function readMigrationHash(migrationsFolder: string, tag: string) {
	const migrationPath = resolve(migrationsFolder, `${tag}.sql`);
	const contents = readFileSync(migrationPath, "utf8");

	return createHash("sha256").update(contents).digest("hex");
}

async function bootstrapExistingDatabase(migrationsFolder: string) {
	await ensureMigrationsTable();

	const migrationCount = await getExistingMigrationCount();
	if (migrationCount > 0) {
		return;
	}

	const bootstrapTags = await detectBootstrapTags();
	if (bootstrapTags.length === 0) {
		return;
	}

	const journal = readJournal(migrationsFolder);
	const journalEntries = journal.entries.filter((entry) =>
		bootstrapTags.includes(entry.tag),
	);

	console.info(
		`Bootstrapping migration history for existing database: ${bootstrapTags.join(", ")}`,
	);

	for (const entry of journalEntries) {
		await pool.query(
			`
				INSERT INTO "drizzle"."__drizzle_migrations" ("hash", "created_at")
				VALUES ($1, $2)
			`,
			[readMigrationHash(migrationsFolder, entry.tag), entry.when],
		);
	}
}

async function main() {
	const migrationsFolder = resolve(process.cwd(), "drizzle");

	console.info(`Applying database migrations from ${migrationsFolder}`);
	await bootstrapExistingDatabase(migrationsFolder);
	await migrate(db, { migrationsFolder });
	console.info("Database migrations applied successfully");
}

void main()
	.catch((error) => {
		console.error("Failed to apply database migrations");
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await pool.end();
	});
