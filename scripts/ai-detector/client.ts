import { startLocalExperiment } from "./server";

const { server, agent } = await startLocalExperiment(0);
try {
	const url = new URL("/apps/ai-detector", server.url).href;
	const valid = await agent.sign(url);
	const tampered = await agent.sign(url);
	const cases = [
		{ name: "署名なし", request: new Request(url), expected: "public" },
		{
			name: "正しいテスト署名",
			request: valid,
			expected: "verified-test-agent",
		},
		{ name: "同じnonceの再利用", request: valid, expected: "public" },
		{
			name: "署名対象URLの改変",
			request: new Request(`${url}?changed=1`, { headers: tampered.headers }),
			expected: "public",
		},
		{
			name: "期限切れ",
			request: await agent.sign(url, {
				created: Math.floor(Date.now() / 1_000) - 600,
				expires: Math.floor(Date.now() / 1_000) - 300,
			}),
			expected: "public",
		},
		{
			name: "User-Agentの偽装",
			request: new Request(url, { headers: { "User-Agent": "ChatGPT" } }),
			expected: "public",
		},
	];
	for (const entry of cases) {
		const response = await fetch(entry.request, { redirect: "error" });
		const html = await response.text();
		const variant = response.headers.get("x-content-variant");
		if (variant !== entry.expected || !html.includes("<h1>")) {
			throw new Error(`${entry.name}: 期待=${entry.expected} 実際=${variant}`);
		}
		console.info(
			JSON.stringify({
				case: entry.name,
				result: "pass",
				contentVariant: variant,
			}),
		);
	}
} finally {
	await server.stop(true);
}
