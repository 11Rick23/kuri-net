import { describe, expect, test } from "bun:test";
import {
	createDetectionResponse,
	type DetectionLog,
} from "@/features/tools/ai-detector/server/handler";
import { createAgentDetector } from "@/features/tools/ai-detector/server/verify";
import { createTestAgent } from "../../../../../scripts/ai-detector/testAgent";

const agent = await createTestAgent();
const ORIGIN = "https://site.example";
const PATH = "/apps/ai-detector";

describe("AI判定HTMLレスポンス", () => {
	test("空クエリの末尾も署名対象URLとして保持する", async () => {
		// 機能要件：プロキシのorigin復元時も署名対象URLの末尾の疑問符を失わない。
		// Given
		const signed = await agent.sign(`${ORIGIN}${PATH}?`);
		const detect = createAgentDetector({
			trustedSigners: [agent.trustedSigner],
		});
		// When
		const response = await createDetectionResponse(
			new Request(`http://localhost:3000${PATH}?`, { headers: signed.headers }),
			{ publicOrigin: ORIGIN, detect, log: () => {} },
		);
		// Then
		expect(response.headers.get("x-content-variant")).toBe(
			"verified-test-agent",
		);
	});

	test("署名なしのHTMLをサーバーで決め、キャッシュを禁止する", async () => {
		// 機能要件：JavaScriptに依存せず一般向けの判定をHTMLに含める。
		// Given
		const logs: DetectionLog[] = [];
		const request = new Request(`${ORIGIN}${PATH}`, {
			headers: { "User-Agent": "Chrome" },
		});
		// When
		const response = await createDetectionResponse(request, {
			publicOrigin: ORIGIN,
			log: (entry) => logs.push(entry),
		});
		const html = await response.text();
		// Then
		expect(response.headers.get("x-content-variant")).toBe("public");
		expect(response.headers.get("cache-control")).toContain("no-store");
		expect(response.headers.get("content-security-policy")).toContain(
			"default-src 'none'",
		);
		expect(html).toContain("誰でしょう？");
		expect(html).not.toContain("あなたは人間です");
		expect(html).not.toContain("<script");
		expect(html).not.toContain("VERIFIED CHATGPT AGENT VERSION");
		expect(logs[0].status).toBe("unsigned");
		expect(logs[0].requestId).toBe(response.headers.get("x-request-id") ?? "");
	});

	test("プロキシの内部URLを公開originに復元し、転送ホストの偽装を無視する", async () => {
		// 機能要件：設定された公開URLで署名を検証し、内部のホスト名に依存しない。
		// 非機能要件：クライアントが注入した転送ヘッダーを信頼しない。
		// Given
		const signed = await agent.sign(`${ORIGIN}${PATH}`);
		const headers = new Headers(signed.headers);
		headers.set("x-forwarded-host", "attacker.invalid");
		headers.set("x-forwarded-proto", "http");
		const internal = new Request(`http://localhost:3000${PATH}`, { headers });
		const detect = createAgentDetector({
			trustedSigners: [agent.trustedSigner],
		});
		const logs: DetectionLog[] = [];
		// When
		const response = await createDetectionResponse(internal, {
			publicOrigin: ORIGIN,
			detect,
			log: (entry) => logs.push(entry),
		});
		const html = await response.text();
		// Then
		expect(response.headers.get("x-content-variant")).toBe(
			"verified-test-agent",
		);
		expect(html).toContain("VERIFIED TEST AGENT VERSION");
		expect(html).not.toContain("VERIFIED CHATGPT AGENT VERSION");
		expect(JSON.stringify(logs)).not.toContain(signed.headers.get("signature"));
		expect(JSON.stringify(logs)).not.toContain('nonce":"');
	});

	test("設定したoriginと異なるURLの署名を採用しない", async () => {
		// 機能要件：転送ヘッダーを書き換えて別サイト向け署名を流用させない。
		// Given
		const signed = await agent.sign(`https://attacker.invalid${PATH}`);
		const headers = new Headers(signed.headers);
		headers.set("x-forwarded-host", "attacker.invalid");
		const detect = createAgentDetector({
			trustedSigners: [agent.trustedSigner],
		});
		// When
		const response = await createDetectionResponse(
			new Request(`http://localhost:3000${PATH}`, { headers }),
			{ publicOrigin: ORIGIN, detect, log: () => {} },
		);
		// Then
		expect(response.headers.get("x-content-variant")).toBe("public");
	});

	test("不正ヘッダーをHTMLエスケープし、クエリやCookieをログに残さない", async () => {
		// 機能要件：受信したヘッダーを実行可能なHTMLとして出力しない。
		// 非機能要件：署名、Cookie、クエリなど不要な値を記録しない。
		// Given
		const payload = '<img src=x onerror="alert(1)">';
		const request = new Request(`${ORIGIN}${PATH}?secret=private-value`, {
			headers: { "Signature-Agent": payload, Cookie: "session=private-cookie" },
		});
		const logs: DetectionLog[] = [];
		// When
		const response = await createDetectionResponse(request, {
			publicOrigin: ORIGIN,
			log: (entry) => logs.push(entry),
		});
		const html = await response.text();
		// Then
		expect(html).toContain("&lt;img");
		expect(html).not.toContain(payload);
		expect(JSON.stringify(logs)).not.toContain("private-value");
		expect(JSON.stringify(logs)).not.toContain("private-cookie");
	});

	test("公開originが未設定なら確認済みにしない", async () => {
		// 機能要件：署名対象の公開URLを確定できない設定では認証を成立させない。
		// Given
		const signed = await agent.sign(`${ORIGIN}${PATH}`);
		// When
		const response = await createDetectionResponse(signed, {
			publicOrigin: undefined,
			log: () => {},
		});
		// Then
		expect(response.headers.get("x-content-variant")).toBe("public");
		expect(await response.text()).toContain("verification_error");
	});
});
