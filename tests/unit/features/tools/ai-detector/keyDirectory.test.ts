import { describe, expect, test } from "bun:test";
import {
	createOpenAIKeyResolver,
	OPENAI_DIRECTORY,
} from "@/features/tools/ai-detector/server/keyDirectory";
import { createTestAgent } from "../../../../../scripts/ai-detector/testAgent";

const agent = await createTestAgent();
const NOW = 1_793_491_200_000;

describe("OpenAI公開鍵ディレクトリ", () => {
	test("固定HTTPS URLだけを取得し、並行取得と既知鍵の再取得をまとめる", async () => {
		// 機能要件：公開鍵をキャッシュし、同時リクエストの取得を一本化する。
		// 非機能要件：取得先を固定し、リダイレクトを禁止し、タイムアウトを設定する。
		// Given
		const calls: { url: string; init: RequestInit }[] = [];
		const resolve = createOpenAIKeyResolver({
			clock: () => NOW,
			async fetchDirectory(url, init) {
				calls.push({ url, init });
				return Response.json({ keys: [agent.publicJwk] });
			},
		});
		// When
		const results = await Promise.all([
			resolve(agent.publicJwk.kid, NOW / 1_000),
			resolve(agent.publicJwk.kid, NOW / 1_000),
		]);
		await resolve(agent.publicJwk.kid, NOW / 1_000);
		// Then
		expect(calls).toHaveLength(1);
		expect(calls[0].url).toBe(OPENAI_DIRECTORY);
		expect(calls[0].init.redirect).toBe("error");
		expect(calls[0].init.signal).toBeInstanceOf(AbortSignal);
		expect(results[0].keyid).toBe(agent.publicJwk.kid);
	});

	test("未知鍵で連続取得せず、更新間隔後には鍵ローテーションを取得する", async () => {
		// 機能要件：未知鍵の取得頻度を制限しながら鍵の追加を反映する。
		// Given
		let now = NOW;
		let calls = 0;
		const rotated = await createTestAgent();
		const resolve = createOpenAIKeyResolver({
			clock: () => now,
			async fetchDirectory() {
				calls++;
				return Response.json({
					keys:
						calls === 1
							? [agent.publicJwk]
							: [agent.publicJwk, rotated.publicJwk],
				});
			},
		});
		await resolve(agent.publicJwk.kid, now / 1_000);
		// When / Then
		await expect(resolve(rotated.publicJwk.kid, now / 1_000)).rejects.toThrow(
			"unknown_key",
		);
		expect(calls).toBe(1);
		now += 30_000;
		expect((await resolve(rotated.publicJwk.kid, now / 1_000)).keyid).toBe(
			rotated.publicJwk.kid,
		);
		expect(calls).toBe(2);
	});

	test.each([
		"応答失敗",
		"JSON不正",
		"サイズ超過",
		"ストリーム超過",
		"鍵指紋不一致",
	])("%sを検証成功として扱わない", async (scenario) => {
		// 機能要件：取得や解析に失敗した公開鍵を使用しない。
		// 非機能要件：Content-Lengthがなくても応答サイズを制限する。
		// Given
		const resolve = createOpenAIKeyResolver({
			clock: () => NOW,
			async fetchDirectory() {
				if (scenario === "応答失敗") return new Response(null, { status: 503 });
				if (scenario === "JSON不正") return new Response("invalid-json");
				if (scenario === "サイズ超過")
					return new Response("{}", { headers: { "Content-Length": "65537" } });
				if (scenario === "ストリーム超過")
					return new Response(
						new ReadableStream({
							start(controller) {
								controller.enqueue(new Uint8Array(65_537));
								controller.close();
							},
						}),
					);
				return Response.json({
					keys: [{ ...agent.publicJwk, kid: "incorrect" }],
				});
			},
		});
		// When / Then
		await expect(
			resolve(
				scenario === "鍵指紋不一致" ? "incorrect" : agent.publicJwk.kid,
				NOW / 1_000,
			),
		).rejects.toThrow();
	});

	test("キャッシュ済みでも鍵の有効期限をアクセスごとに確認する", async () => {
		// 機能要件：期限切れの鍵や利用開始前の鍵を採用しない。
		// Given
		const seconds = NOW / 1_000;
		const resolve = createOpenAIKeyResolver({
			clock: () => NOW,
			async fetchDirectory() {
				return Response.json({
					keys: [{ ...agent.publicJwk, nbf: seconds, exp: seconds + 10 }],
				});
			},
		});
		await resolve(agent.publicJwk.kid, seconds);
		// When / Then
		await expect(resolve(agent.publicJwk.kid, seconds - 1)).rejects.toThrow(
			"key_outside_validity",
		);
		await expect(resolve(agent.publicJwk.kid, seconds + 10)).rejects.toThrow(
			"key_outside_validity",
		);
	});

	test("期限切れキャッシュの更新失敗時に古い鍵で成功扱いしない", async () => {
		// 機能要件：更新障害時は古い公開鍵へ暗黙にフォールバックしない。
		// Given
		let now = NOW;
		let calls = 0;
		const resolve = createOpenAIKeyResolver({
			clock: () => now,
			async fetchDirectory() {
				if (++calls > 1) throw new Error("offline");
				return Response.json({ keys: [agent.publicJwk] });
			},
		});
		await resolve(agent.publicJwk.kid, now / 1_000);
		now += 300_000;
		// When / Then
		await expect(resolve(agent.publicJwk.kid, now / 1_000)).rejects.toThrow(
			"key_directory_unavailable",
		);
		await expect(resolve(agent.publicJwk.kid, now / 1_000)).rejects.toThrow(
			"key_directory_unavailable",
		);
		expect(calls).toBe(2);
	});
});
