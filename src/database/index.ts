import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
	throw new Error(
		"DATABASE_URL is not set. Please define it in your environment.",
	);
}

const pool = new Pool({
	connectionString: url,
});

export const db = drizzle(pool);
