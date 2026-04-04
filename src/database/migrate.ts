import { resolve } from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index";

async function main() {
	const migrationsFolder = resolve(process.cwd(), "drizzle");

	console.info(`Applying database migrations from ${migrationsFolder}`);
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
