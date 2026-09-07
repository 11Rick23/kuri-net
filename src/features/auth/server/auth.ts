import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { passkey } from "@better-auth/passkey";
import { APIError, betterAuth } from "better-auth";
import { anonymous } from "better-auth/plugins";
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
	getAuthUserStateByID,
	synchronizePasskeyOwnerAfterAuthentication,
} from "@/features/auth/data/repository";
import { validateDisplayName } from "@/features/auth/shared/displayName";
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
					const user = await getAuthUserStateByID(session.userId);

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
					await synchronizePasskeyOwnerAfterAuthentication(clientData.id);
				},
			},
		}),
	],
});
