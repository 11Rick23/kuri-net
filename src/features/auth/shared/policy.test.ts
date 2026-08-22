import { describe, expect, test } from "bun:test";
import {
	hasRequiredUserVerification,
	isAuthenticatedUserState,
} from "@/features/auth/shared/policy";

describe("isAuthenticatedUserState", () => {
	test("有効な通常ユーザーの保護機能利用を許可する", () => {
		// 機能要件：有効、非匿名、プロフィール設定済みのユーザーは保護機能を利用できる。
		// Given
		const user = {
			status: "ACTIVE" as const,
			isAnonymous: false,
			profileCompleted: true,
		};

		// When
		const authenticated = isAuthenticatedUserState(user);

		// Then
		expect(authenticated).toBe(true);
	});

	test.each([
		["ユーザーが存在しない", undefined],
		[
			"登録途中である",
			{
				status: "REGISTERING" as const,
				isAnonymous: true,
				profileCompleted: false,
			},
		],
		[
			"匿名ユーザーである",
			{
				status: "ACTIVE" as const,
				isAnonymous: true,
				profileCompleted: true,
			},
		],
		[
			"プロフィールが未設定である",
			{
				status: "ACTIVE" as const,
				isAnonymous: false,
				profileCompleted: false,
			},
		],
		[
			"利用停止中である",
			{
				status: "SUSPENDED" as const,
				isAnonymous: false,
				profileCompleted: true,
			},
		],
	] as const)("%s場合は保護機能の利用を拒否する", (_condition, user) => {
		// 機能要件：認証条件を満たさないユーザーは保護機能を利用できない。
		// 非機能要件：状態の一部だけを満たすユーザーを認証済みとして扱わない。
		// Given
		const currentUser = user;

		// When
		const authenticated = isAuthenticatedUserState(currentUser);

		// Then
		expect(authenticated).toBe(false);
	});
});

describe("hasRequiredUserVerification", () => {
	test("ユーザー検証の完了が明示されたパスキーを許可する", () => {
		// 機能要件：ユーザー検証済みのパスキーは認証に使用できる。
		// Given
		const userVerified = true;

		// When
		const accepted = hasRequiredUserVerification(userVerified);

		// Then
		expect(accepted).toBe(true);
	});

	test("ユーザー検証が未完了または未指定なら拒否する", () => {
		// 機能要件：ユーザー検証済みと確認できないパスキーは認証に使用できない。
		// 非機能要件：ユーザー検証情報が欠落した場合も安全側に拒否する。
		// Given
		const unverifiedValues = [false, undefined];

		// When
		const results = unverifiedValues.map((value) =>
			hasRequiredUserVerification(value),
		);

		// Then
		expect(results).toEqual([false, false]);
	});
});
