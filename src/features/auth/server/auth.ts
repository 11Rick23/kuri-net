import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { passkey } from "@better-auth/passkey";
import { APIError, betterAuth } from "better-auth";
import { anonymous } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "@/database";
import {
	authAccounts,
	authPasskeys,
	authRateLimits,
	authSessions,
	authVerifications,
	users,
} from "@/database/schema";
import {
	DEFAULT_DISPLAY_NAME,
	validateDisplayName,
} from "@/features/auth/shared/displayName";
import { hasRequiredUserVerification } from "@/features/auth/shared/policy";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

if (!secret) {
	throw new Error("BETTER_AUTH_SECRET is not set.");
}

if (!baseURL) {
	throw new Error("BETTER_AUTH_URL is not set.");
}

const authURL = new URL(baseURL);

function requireUserVerification(userVerified: boolean | undefined) {
	if (!hasRequiredUserVerification(userVerified)) {
		throw new APIError("UNAUTHORIZED", {
			message: "ユーザー検証が完了していないパスキーは使用できません。",
		});
	}
}

export const auth = betterAuth({
	appName: "kuri net",
	baseURL: authURL.origin,
	secret,
	database: drizzleAdapter(db, {
		provider: "pg",
		transaction: true,
		schema: {
			user: users,
			session: authSessions,
			account: authAccounts,
			verification: authVerifications,
			passkey: authPasskeys,
			rateLimit: authRateLimits,
		},
	}),
	emailAndPassword: {
		enabled: false,
	},
	user: {
		additionalFields: {
			status: {
				type: ["REGISTERING", "ACTIVE", "SUSPENDED"],
				required: true,
				defaultValue: "REGISTERING",
				input: false,
			},
			profileCompleted: {
				type: "boolean",
				required: true,
				defaultValue: false,
				input: false,
			},
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
		cookieCache: {
			enabled: false,
		},
	},
	rateLimit: {
		enabled: true,
		storage: "database",
		window: 60,
		max: 100,
		customRules: {
			"/sign-in/anonymous": { window: 60, max: 3 },
			"/passkey/generate-register-options": { window: 60, max: 5 },
			"/passkey/verify-registration": { window: 60, max: 5 },
			"/passkey/generate-authenticate-options": {
				window: 60,
				max: 10,
			},
			"/passkey/verify-authentication": { window: 60, max: 10 },
		},
	},
	databaseHooks: {
		user: {
			update: {
				before: async (user) => {
					if (typeof user.name !== "string") {
						return;
					}

					const result = validateDisplayName(user.name);
					if (!result.ok) {
						throw new APIError("BAD_REQUEST", { message: result.error });
					}

					return { data: { ...user, name: result.value } };
				},
			},
		},
		session: {
			create: {
				before: async (session) => {
					const [user] = await db
						.select({ status: users.status })
						.from(users)
						.where(eq(users.id, session.userId))
						.limit(1);

					if (!user || user.status === "SUSPENDED") {
						throw new APIError("FORBIDDEN", {
							message: "このアカウントは利用できません。",
						});
					}
				},
			},
		},
	},
	plugins: [
		anonymous({
			generateName: () => "登録中",
			generateRandomEmail: () => `auth-${crypto.randomUUID()}@users.invalid`,
		}),
		passkey({
			rpID: authURL.hostname,
			rpName: "kuri net",
			origin: authURL.origin,
			authenticatorSelection: {
				residentKey: "required",
				userVerification: "required",
			},
			registration: {
				afterVerification: ({ verification }) => {
					requireUserVerification(verification.registrationInfo?.userVerified);
				},
			},
			authentication: {
				afterVerification: async ({ verification, clientData }) => {
					requireUserVerification(verification.authenticationInfo.userVerified);

					const [passkeyOwner] = await db
						.select({
							id: users.id,
							name: users.name,
							status: users.status,
							isAnonymous: users.isAnonymous,
							profileCompleted: users.profileCompleted,
						})
						.from(authPasskeys)
						.innerJoin(users, eq(users.id, authPasskeys.userId))
						.where(eq(authPasskeys.credentialID, clientData.id))
						.limit(1);

					if (!passkeyOwner) {
						return;
					}

					if (
						passkeyOwner.status === "ACTIVE" &&
						!passkeyOwner.isAnonymous &&
						!passkeyOwner.profileCompleted
					) {
						await db
							.update(users)
							.set({
								name: DEFAULT_DISPLAY_NAME,
								profileCompleted: true,
								updatedAt: new Date(),
							})
							.where(eq(users.id, passkeyOwner.id));
						return;
					}

					if (passkeyOwner.status !== "REGISTERING") {
						return;
					}

					const displayName = validateDisplayName(passkeyOwner.name);
					if (!displayName.ok) {
						return;
					}

					await db
						.update(users)
						.set({
							name: displayName.value,
							status: "ACTIVE",
							isAnonymous: false,
							profileCompleted: true,
							updatedAt: new Date(),
						})
						.where(eq(users.id, passkeyOwner.id));
				},
			},
		}),
	],
});
