import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL;
if (!url) {
	throw new Error(
		"DATABASE_URL is not set. Please define it in your environment.",
	);
}

export default defineConfig({
	out: "./drizzle",
	schema: "./database/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: url,
	},
});
