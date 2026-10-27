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
const createdUserIDs = new Set<string>();
const createdDisplayNames = new Set<string>();

test.afterEach(async () => {
	await pool.query(
		"DELETE FROM users WHERE id = ANY($1::text[]) OR name = ANY($2::text[])",
		[[...createdUserIDs], [...createdDisplayNames]],
	);
	await pool.query(
		"DELETE FROM auth_rate_limits WHERE key LIKE '%|/sign-in/anonymous'",
	);
	createdUserIDs.clear();
	createdDisplayNames.clear();
});

test.afterAll(async () => {
	await pool.end();
});

function createDisplayName(label: string): string {
	const displayName = `${label}-${crypto.randomUUID()}`;
	createdDisplayNames.add(displayName);
	return displayName;
}

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

async function expectLoggedIn(page: Page) {
	await expect(
		page.getByRole("button", { name: "ログアウト", exact: true }),
	).toBeVisible();
}

async function expectLoggedOut(page: Page) {
	await expect(
		page.getByRole("button", { name: "ログイン", exact: true }),
	).toBeVisible();
}

async function getRegisteredUser(displayName: string) {
	const result = await pool.query<{
		id: string;
		name: string;
		passkey_name: string;
		profile_completed: boolean;
		status: string;
		is_anonymous: boolean;
	}>(
		"SELECT u.id, u.name, u.status, u.is_anonymous, u.profile_completed, p.name AS passkey_name FROM users u INNER JOIN auth_passkeys p ON p.user_id = u.id WHERE u.name = $1",
		[displayName],
	);

	const user = result.rows[0];
	expect(user).toBeDefined();
	if (!user) {
		throw new Error("登録したE2Eユーザーを取得できませんでした。");
	}

	createdUserIDs.add(user.id);
	return user;
}

test("新規ユーザーを表示名付きのパスキーで登録する", async ({ page }) => {
	// 機能要件：新規ユーザーは表示名とパスキーを登録し、認証済み状態へ移行できる。
	// 非機能要件：ユーザー、パスキー、WebAuthnクレデンシャルの表示名を一致させる。
	// Given
	const displayName = createDisplayName("新規登録");
	const { cdp, authenticatorId } = await addVirtualAuthenticator(page);
	await page.goto("/");
	await openRegistration(page);

	// When
	await submitRegistration(page, displayName);

	// Then
	await expectLoggedIn(page);
	const user = await getRegisteredUser(displayName);
	expect(user).toMatchObject({
		name: displayName,
		passkey_name: displayName,
		profile_completed: true,
		status: "ACTIVE",
		is_anonymous: false,
	});

	const { credentials } = await cdp.send("WebAuthn.getCredentials", {
		authenticatorId,
	});
	expect(credentials).toHaveLength(1);
	expect(credentials[0]?.userName).toBe(displayName);
});

test("登録済みのパスキーで再ログインする", async ({ page }) => {
	// 機能要件：登録済みユーザーは同じパスキーを使って再ログインできる。
	// Given
	const displayName = createDisplayName("再ログイン");
	await addVirtualAuthenticator(page);
	await page.goto("/");
	await openRegistration(page);
	await submitRegistration(page, displayName);
	await expectLoggedIn(page);
	await getRegisteredUser(displayName);
	await page.getByRole("button", { name: "ログアウト", exact: true }).click();
	await expectLoggedOut(page);

	// When
	await page.getByRole("button", { name: "ログイン", exact: true }).click();

	// Then
	await expectLoggedIn(page);
	await expect(page).toHaveURL(/\/$/);
});

test("移行前ユーザーのプロフィールを再ログイン時に補完する", async ({
	page,
}) => {
	// 機能要件：プロフィール未設定の既存ユーザーは再認証時に既定表示名で利用可能になる。
	// Given
	const displayName = createDisplayName("移行ユーザー");
	await addVirtualAuthenticator(page);
	await page.goto("/");
	await openRegistration(page);
	await submitRegistration(page, displayName);
	await expectLoggedIn(page);
	const user = await getRegisteredUser(displayName);
	await page.getByRole("button", { name: "ログアウト", exact: true }).click();
	await expectLoggedOut(page);
	await pool.query(
		"UPDATE users SET name = id, profile_completed = false WHERE id = $1",
		[user.id],
	);

	// When
	await page.getByRole("button", { name: "ログイン", exact: true }).click();

	// Then
	await expectLoggedIn(page);
	const completedUser = await pool.query<{
		name: string;
		profile_completed: boolean;
	}>("SELECT name, profile_completed FROM users WHERE id = $1", [user.id]);
	expect(completedUser.rows[0]).toEqual({
		name: "名無し",
		profile_completed: true,
	});
});

test("パスキー登録を中断した一時ユーザーを削除する", async ({ page }) => {
	// 機能要件：パスキー登録を中断した場合は登録途中の一時ユーザーを削除する。
	// 非機能要件：中断した登録の匿名ユーザーをDBへ残さない。
	// Given
	const displayName = createDisplayName("登録中断");
	const { cdp, authenticatorId } = await addVirtualAuthenticator(page);
	await page.goto("/");
	await openRegistration(page);
	await cdp.send("WebAuthn.setAutomaticPresenceSimulation", {
		authenticatorId,
		enabled: false,
	});

	// When
	await submitRegistration(page, displayName);
	await expect(
		page.getByRole("button", { name: "登録中…", exact: true }),
	).toBeVisible();
	await cdp.send("WebAuthn.removeVirtualAuthenticator", { authenticatorId });

	// Then
	await expect(page.getByRole("alert")).toBeVisible();
	const incompleteUsers = await pool.query<{ count: string }>(
		"SELECT count(*)::text AS count FROM users WHERE status = 'REGISTERING' AND is_anonymous = true AND name = $1",
		[displayName],
	);
	expect(incompleteUsers.rows[0]?.count).toBe("0");
});
