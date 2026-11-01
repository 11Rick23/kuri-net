import { describe, expect, test } from "bun:test";
import { appendSignature, createSignature } from "http-message-sig";
import { createReplayCache } from "@/features/tools/ai-detector/server/replayCache";
import { DetectionError } from "@/features/tools/ai-detector/server/types";
import { createAgentDetector } from "@/features/tools/ai-detector/server/verify";
import {
	createTestAgent,
	TEST_AGENT,
} from "../../../../../scripts/ai-detector/testAgent";

const NOW = 1_793_491_200_000;
const URL = "https://site.example/apps/ai-detector";
const agent = await createTestAgent();

function detector() {
	return createAgentDetector({
		trustedSigners: [agent.trustedSigner],
		clock: () => NOW,
	});
}

describe("AIエージェント署名検証", () => {
	test("OpenAIを名乗っても未承認の鍵による正しい署名は採用しない", async () => {
		// 機能要件：暗号署名が正しくても、信頼済み主体の鍵と一致しなければ認証しない。
		// Given
		const other = await createTestAgent();
		const signed = await agent.sign(URL, {
			now: NOW,
			agent: "https://chatgpt.com",
		});
		const detect = createAgentDetector({
			clock: () => NOW,
			trustedSigners: [
				{
					...other.trustedSigner,
					agents: ["https://chatgpt.com"],
					status: "verified_openai",
				},
			],
		});
		// When
		const result = await detect(signed);
		// Then
		expect(result.status).toBe("invalid_signature");
		expect(result.reason).toBe("unknown_key");
	});

	test("時刻の許容差30秒の境界を適用する", async () => {
		// 機能要件：明示した時計の許容差以内だけ時刻のずれを受け入れる。
		// Given
		const seconds = NOW / 1_000;
		const inside = await agent.sign(URL, {
			now: NOW,
			created: seconds - 600,
			expires: seconds - 30,
		});
		const outside = await agent.sign(URL, {
			now: NOW,
			created: seconds - 600,
			expires: seconds - 31,
		});
		// When
		const accepted = await detector()(inside);
		const rejected = await detector()(outside);
		// Then
		expect(accepted.status).toBe("verified_test_agent");
		expect(rejected.reason).toBe("signature_expired");
	});

	test("巨大な署名ヘッダーを公開鍵の解決前に拒否する", async () => {
		// 機能要件：過大な署名メタデータを処理しない。
		// 非機能要件：拒否したアクセスで外部の鍵取得を発生させない。
		// Given
		let called = false;
		const detect = createAgentDetector({
			trustedSigners: [
				{
					...agent.trustedSigner,
					async resolveKey() {
						called = true;
						throw new Error("unexpected call");
					},
				},
			],
		});
		const request = new Request(URL, {
			headers: {
				signature: "x".repeat(8_193),
				"signature-input": "test=()",
				"signature-agent": JSON.stringify(TEST_AGENT),
			},
		});
		// When
		const result = await detect(request);
		// Then
		expect(result.status).toBe("invalid_signature");
		expect(result.reason).toBe("signature_headers_too_large");
		expect(called).toBe(false);
	});

	test.each([
		[{}, "unsigned"],
		[{ "User-Agent": "ChatGPT" }, "unsigned"],
		[{ "Signature-Agent": '"https://chatgpt.com"' }, "invalid_signature"],
		[
			{
				Signature: "test=:AAAA:",
				"Signature-Input": "invalid",
				"Signature-Agent": JSON.stringify(TEST_AGENT),
			},
			"invalid_signature",
		],
	] as const)(
		"署名が揃わないアクセスを確認済みにしない: %j",
		async (headers, expected) => {
			// 機能要件：署名なしや文字列の自己申告だけでは署名主体を認証しない。
			// Given
			const request = new Request(URL, { headers });
			// When
			const result = await detector()(request);
			// Then
			expect(result.status).toBe(expected);
		},
	);

	test.each(["legacy", "dictionary"] as const)(
		"%s形式の正しい署名をテスト主体として認証する",
		async (format) => {
			// 機能要件：旧文字列形式と辞書形式を元のヘッダーのまま検証できる。
			// Given
			const request = await agent.sign(URL, { now: NOW, format });
			// When
			const result = await detector()(request);
			// Then
			expect(result.status).toBe("verified_test_agent");
			expect(result.signatures[0].authenticated).toBe(true);
			expect(result.replayProtection).toBe("nonce");
		},
	);

	test("alg省略時は信頼済み鍵からアルゴリズムを確定する", async () => {
		// 機能要件：RFCで省略可能なalgは信頼済み鍵のアルゴリズムで検証する。
		// Given
		const request = await agent.sign(URL, {
			now: NOW,
			includeAlgorithm: false,
		});
		// When
		const result = await detector()(request);
		// Then
		expect(result.status).toBe("verified_test_agent");
		expect(result.signatures[0].algorithm).toBe("ed25519");
	});

	test.each([
		"署名",
		"URL",
		"署名主体",
		"鍵ID",
		"期限切れ",
		"未来",
		"長すぎる有効期間",
		"tag",
	])("%sの改変や不正を確認済みにしない", async (scenario) => {
		// 機能要件：改変、未知の鍵、時刻やプロファイル違反では署名を採用しない。
		// Given
		const seconds = NOW / 1_000;
		const signed = await agent.sign(URL, {
			now: NOW,
			keyid: scenario === "鍵ID" ? "unknown" : undefined,
			created:
				scenario === "期限切れ"
					? seconds - 600
					: scenario === "未来"
						? seconds + 31
						: seconds,
			expires:
				scenario === "期限切れ"
					? seconds - 31
					: scenario === "長すぎる有効期間"
						? seconds + 86_401
						: seconds + 300,
			tag: scenario === "tag" ? "other" : "web-bot-auth",
		});
		const headers = new Headers(signed.headers);
		if (scenario === "署名")
			headers.set("signature", `test=:${btoa("x".repeat(64))}:`);
		if (scenario === "署名主体")
			headers.set("signature-agent", '"https://attacker.invalid"');
		const request = new Request(scenario === "URL" ? `${URL}?changed=1` : URL, {
			headers,
		});
		// When
		const result = await detector()(request);
		// Then
		expect(result.status).toBe(
			scenario === "署名主体" ? "unknown_signer" : "invalid_signature",
		);
	});

	test("未知の署名主体を取得せず、公開鍵取得失敗も成功にしない", async () => {
		// 機能要件：信頼済みの主体だけを解決し、依存先の障害は未検証として返す。
		// 非機能要件：任意のSignature-Agent URLへの取得を行わない。
		// Given
		let calls = 0;
		const detect = createAgentDetector({
			clock: () => NOW,
			trustedSigners: [
				{
					...agent.trustedSigner,
					async resolveKey() {
						calls++;
						throw new DetectionError("key_directory_unavailable");
					},
				},
			],
		});
		const unknown = await agent.sign(URL, {
			now: NOW,
			agent: "https://127.0.0.1/private",
		});
		const known = await agent.sign(URL, { now: NOW });
		// When
		const first = await detect(unknown);
		const unknownCalls = calls;
		const second = await detect(known);
		// Then
		expect(first.status).toBe("unknown_signer");
		expect(unknownCalls).toBe(0);
		expect(second.status).toBe("verification_error");
		expect(calls).toBe(1);
	});

	test("同一nonceへの並行アクセスは一度だけ採用する", async () => {
		// 機能要件：検証済み署名のnonceを再利用したアクセスは認証しない。
		// 非機能要件：同一プロセス内の並行アクセスでも再利用を検出する。
		// Given
		const request = await agent.sign(URL, { now: NOW });
		const detect = detector();
		// When
		const results = await Promise.all([detect(request), detect(request)]);
		// Then
		expect(
			results.filter((result) => result.status === "verified_test_agent"),
		).toHaveLength(1);
		expect(
			results.filter((result) => result.reason === "replay_detected"),
		).toHaveLength(1);
	});

	test("nonceがない署名は再利用防止を保証したと表示しない", async () => {
		// 機能要件：nonceがない互換署名ではリプレイ防止の不在を結果に残す。
		// Given
		const request = await agent.sign(URL, { now: NOW, nonce: null });
		const detect = detector();
		// When
		const results = await Promise.all([detect(request), detect(request)]);
		// Then
		expect(
			results.every(
				(result) =>
					result.status === "verified_test_agent" &&
					result.replayProtection === "unavailable",
			),
		).toBe(true);
	});

	test("authorityのみの署名ではパス改変を検出できないことを記録する", async () => {
		// 機能要件：署名対象外のパスまで暗号学的に保護されていると扱わない。
		// Given
		const signed = await agent.sign(URL, {
			now: NOW,
			components: ["@authority", "signature-agent"],
		});
		// When
		const result = await detector()(
			new Request("https://site.example/changed", { headers: signed.headers }),
		);
		// Then
		expect(result.status).toBe("verified_test_agent");
		expect(result.signatures[0].components).toEqual([
			'"@authority"',
			'"signature-agent"',
		]);
	});

	test("署名対象のホストやメソッドを変更したアクセスを拒否する", async () => {
		// 機能要件：署名対象のリクエスト情報が変われば検証を失敗させる。
		// Given
		const signed = await agent.sign(URL, { now: NOW });
		// When
		const host = await detector()(
			new Request("https://other.example/apps/ai-detector", {
				headers: signed.headers,
			}),
		);
		const method = await detector()(
			new Request(URL, { method: "POST", headers: signed.headers }),
		);
		// Then
		expect(host.status).toBe("invalid_signature");
		expect(method.status).toBe("invalid_signature");
	});

	test("本番の信頼設定はローカルテスト鍵を採用しない", async () => {
		// 機能要件：テスト署名をOpenAIの署名として認証しない。
		// Given
		const request = await agent.sign(URL, { now: NOW });
		const detect = createAgentDetector({
			trustedSigners: [
				{
					...agent.trustedSigner,
					agents: ["https://chatgpt.com"],
					status: "verified_openai",
				},
			],
			clock: () => NOW,
		});
		// When
		const result = await detect(request);
		// Then
		expect(result.status).toBe("unknown_signer");
	});

	test("辞書の別ラベルを署名しただけではその主体として認証しない", async () => {
		// 機能要件：署名ラベルに対応するSignature-Agentメンバーの保護を必須にする。
		// Given
		const request = await agent.sign(URL, {
			now: NOW,
			format: "dictionary",
			components: ["@authority", "signature-agent"],
		});
		// When
		const result = await detector()(request);
		// Then
		expect(result.status).toBe("invalid_signature");
	});

	test("別の署名があっても信頼済みラベルを選んで検証する", async () => {
		// 機能要件：複数署名からラベルを対応づけて検証し、先頭の偽署名を採用しない。
		// Given
		const request = await agent.sign(URL, { now: NOW, format: "dictionary" });
		const fields = await createSignature(request, {
			label: "other",
			components: ["@authority"],
			parameters: {},
			signer: { algorithm: "ed25519", sign: () => new Uint8Array(64) },
		});
		const multiple = new Request(URL, {
			headers: appendSignature(request.headers, fields),
		});
		// When
		const result = await detector()(multiple);
		// Then
		expect(result.status).toBe("verified_test_agent");
		expect(result.selectedSignature).toBe("test");
	});

	test("キャッシュ満杯で未期限のnonceを追い出して成功扱いしない", async () => {
		// 機能要件：リプレイ記録の容量不足では認証を保留し、有効な記録を失わない。
		// Given
		const detect = createAgentDetector({
			trustedSigners: [agent.trustedSigner],
			clock: () => NOW,
			replayCache: createReplayCache(1),
		});
		const first = await agent.sign(URL, { now: NOW });
		await detect(first);
		const second = await agent.sign(URL, { now: NOW });
		// When
		const full = await detect(second);
		const replay = await detect(first);
		// Then
		expect(full.status).toBe("verification_error");
		expect(full.reason).toBe("replay_cache_full");
		expect(replay.reason).toBe("replay_detected");
	});
});
