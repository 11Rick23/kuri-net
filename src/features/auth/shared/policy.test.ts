import { describe, expect, test } from "bun:test";
import {
	hasRequiredUserVerification,
	isAuthenticatedUserState,
} from "@/features/auth/shared/policy";

describe("isAuthenticatedUserState", () => {
	test("ACTIVE・非匿名・表示名設定済みだけを許可する", () => {
		expect(
			isAuthenticatedUserState({
				status: "ACTIVE",
				isAnonymous: false,
				profileCompleted: true,
			}),
		).toBe(true);
	});

	test.each([
		{
			status: "REGISTERING" as const,
			isAnonymous: false,
			profileCompleted: true,
		},
		{ status: "ACTIVE" as const, isAnonymous: true, profileCompleted: true },
		{ status: "ACTIVE" as const, isAnonymous: false, profileCompleted: false },
		{
			status: "SUSPENDED" as const,
			isAnonymous: false,
			profileCompleted: true,
		},
	])("保護処理を通過させない: %o", (state) => {
		expect(isAuthenticatedUserState(state)).toBe(false);
	});
});

describe("hasRequiredUserVerification", () => {
	test("UVが明示的にtrueの場合だけ許可する", () => {
		expect(hasRequiredUserVerification(true)).toBe(true);
		expect(hasRequiredUserVerification(false)).toBe(false);
		expect(hasRequiredUserVerification(undefined)).toBe(false);
	});
});
