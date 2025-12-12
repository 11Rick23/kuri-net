import { drizzle } from "drizzle-orm/node-postgres";

const url = process.env.DATABASE_URL;
if (!url) {
	throw new Error(
		"DATABASE_URL is not set. Please define it in your environment.",
	);
}

const db = drizzle(url);
