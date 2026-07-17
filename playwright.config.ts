import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	testMatch: "**/*.e2e.ts",
	fullyParallel: false,
	workers: 1,
	use: {
		baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3100",
		browserName: "chromium",
		channel: "chrome",
		headless: true,
		trace: "retain-on-failure",
	},
});
