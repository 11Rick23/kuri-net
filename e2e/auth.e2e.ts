import { expect, type Page, test } from "@playwright/test";
import { Pool } from "pg";

const databaseURL = process.env.DATABASE_URL;
if (!databaseURL) {
	throw new Error("DATABASE_URL is required for auth E2E tests.");
}

const databaseHost = new URL(databaseURL).hostname;
if (!["localhost", "127.0.0.1", "::1"].includes(databaseHost)) {
	throw new Error("Auth E2E tests require a loopback-only temporary database.");
}

const pool = new Pool({ connectionString: databaseURL });

test.afterAll(async () => {
	await pool.end();
});

async function addVirtualAuthenticator(page: Page) {
	const cdp = await page.context().newCDPSession(page);
	await cdp.send("WebAuthn.enable");
	const { authenticatorId } = await cdp.send(
		"WebAuthn.addVirtualAuthenticator",
		{
			options: {
				protocol: "ctap2",
				transport: "internal",
				hasResidentKey: true,
				hasUserVerification: true,
				isUserVerified: true,
				automaticPresenceSimulation: true,
			},
		},
	);

	return { cdp, authenticatorId };
}

async function openRegistration(page: Page) {
	await page.getByRole("button", { name: "ログイン", exact: true }).click();
	const registrationLink = page.getByRole("button", {
		name: "こちら",
		exact: true,
	});
	await expect(registrationLink).toBeVisible();
	await registrationLink.click();
}

async function submitRegistration(page: Page, displayName: string) {
	await page.getByLabel("表示名", { exact: true }).fill(displayName);
	await page.getByRole("checkbox").check({ force: true });
	await page.getByRole("button", { name: "登録", exact: true }).click();
}

test("新規登録、再ログイン、移行ユーザーの表示名自動設定", async ({ page }) => {
	const { cdp, authenticatorId } = await addVirtualAuthenticator(page);
	await page.goto("/");

	await openRegistration(page);
	await submitRegistration(page, "くり 🍑 テスト");
	await expect(
		page.getByRole("button", { name: "ログアウト", exact: true }),
	).toBeVisible();

	const initialUser = await pool.query<{
		id: string;
		name: string;
		passkey_name: string;
		profile_completed: boolean;
	}>(
		"SELECT u.id, u.name, u.profile_completed, p.name AS passkey_name FROM users u INNER JOIN auth_passkeys p ON p.user_id = u.id WHERE u.email LIKE 'auth-%@users.invalid' ORDER BY u.created_at DESC LIMIT 1",
	);
	const user = initialUser.rows[0];
	expect(user?.name).toBe("くり 🍑 テスト");
	expect(user?.passkey_name).toBe("くり 🍑 テスト");
	expect(user?.profile_completed).toBe(true);

	const { credentials } = await cdp.send("WebAuthn.getCredentials", {
		authenticatorId,
	});
	expect(credentials).toHaveLength(1);
	expect(credentials[0]?.userName).toBe("くり 🍑 テスト");

	await page.getByRole("button", { name: "ログアウト", exact: true }).click();
	await expect(
		page.getByRole("button", { name: "ログイン", exact: true }),
	).toBeVisible();

	await page.getByRole("button", { name: "ログイン", exact: true }).click();
	await expect(
		page.getByRole("button", { name: "ログアウト", exact: true }),
	).toBeVisible();

	await page.getByRole("button", { name: "ログアウト", exact: true }).click();
	await pool.query(
		"UPDATE users SET name = id, profile_completed = false WHERE id = $1",
		[user?.id],
	);

	await page.getByRole("button", { name: "ログイン", exact: true }).click();
	await expect(
		page.getByRole("button", { name: "ログアウト", exact: true }),
	).toBeVisible();
	await expect(page).toHaveURL(/\/$/);

	const completedUser = await pool.query<{
		name: string;
		profile_completed: boolean;
	}>("SELECT name, profile_completed FROM users WHERE id = $1", [user?.id]);
	expect(completedUser.rows[0]).toEqual({
		name: "名無し",
		profile_completed: true,
	});
});

test("パスキー登録を中断した一時ユーザーを削除する", async ({ page }) => {
	const { cdp, authenticatorId } = await addVirtualAuthenticator(page);
	await page.goto("/");
	await openRegistration(page);

	await cdp.send("WebAuthn.setAutomaticPresenceSimulation", {
		authenticatorId,
		enabled: false,
	});
	await submitRegistration(page, "キャンセル確認");
	await expect(
		page.getByRole("button", { name: "登録中…", exact: true }),
	).toBeVisible();
	await cdp.send("WebAuthn.removeVirtualAuthenticator", { authenticatorId });

	await expect(page.getByRole("alert")).toBeVisible();
	const incompleteUsers = await pool.query<{ count: string }>(
		"SELECT count(*)::text AS count FROM users WHERE status = 'REGISTERING' AND is_anonymous = true AND name = 'キャンセル確認'",
	);
	expect(incompleteUsers.rows[0]?.count).toBe("0");
});
