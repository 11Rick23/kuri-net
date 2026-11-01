import { createDetectionResponse } from "../../src/features/tools/ai-detector/server/handler";
import { createAgentDetector } from "../../src/features/tools/ai-detector/server/verify";
import { createTestAgent } from "./testAgent";

export async function startLocalExperiment(port = 3001) {
	const agent = await createTestAgent();
	const detector = createAgentDetector({
		trustedSigners: [agent.trustedSigner],
	});
	const server = Bun.serve({
		hostname: "127.0.0.1",
		port,
		async fetch(request): Promise<Response> {
			const path = new URL(request.url).pathname;
			if (path === "/.well-known/http-message-signatures-directory") {
				return Response.json(
					{ keys: [agent.publicJwk] },
					{
						headers: { "Cache-Control": "no-store" },
					},
				);
			}
			return createDetectionResponse(request, {
				publicOrigin: `http://127.0.0.1:${server.port}`,
				detect: detector,
			});
		},
	});
	return { server, agent };
}

if (import.meta.main) {
	const { server } = await startLocalExperiment();
	console.info(
		`ローカル実験: ${server.url} （テスト鍵のみ。OpenAIの署名ではありません）`,
	);
	console.info(
		"署名付きHTTPテスト: mise exec -- bun scripts/ai-detector/client.ts",
	);
}
