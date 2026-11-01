import { randomUUID } from "node:crypto";
import { contentVariant, renderDetectionPage } from "../render";
import {
	createOpenAIKeyResolver,
	OPENAI_AGENT,
	OPENAI_DIRECTORY,
} from "./keyDirectory";
import type { DetectionResult } from "./types";
import { createAgentDetector } from "./verify";

const detectOpenAI = createAgentDetector({
	trustedSigners: [
		{
			agents: [OPENAI_AGENT, OPENAI_DIRECTORY],
			status: "verified_openai",
			resolveKey: createOpenAIKeyResolver(),
		},
	],
});

export type DetectionLog = {
	event: "ai_agent_detection";
	timestamp: string;
	requestId: string;
	method: string;
	path: string;
	userAgent: string | null;
	contentVariant: string;
} & DetectionResult;

export async function createDetectionResponse(
	request: Request,
	{
		publicOrigin,
		detect = detectOpenAI,
		log = (entry) => console.info(JSON.stringify(entry)),
	}: {
		publicOrigin: string | undefined;
		detect?: (request: Request) => Promise<DetectionResult>;
		log?: (entry: DetectionLog) => void;
	},
) {
	const requestId = randomUUID();
	const incomingUrl = new URL(request.url);
	let result: DetectionResult;
	try {
		if (!publicOrigin) throw new Error("Missing public origin");
		const origin = new URL(publicOrigin);
		if (
			!["https:", "http:"].includes(origin.protocol) ||
			(origin.protocol === "http:" &&
				!["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)) ||
			origin.username ||
			origin.password ||
			origin.search ||
			origin.hash ||
			(origin.pathname !== "/" && origin.pathname !== "")
		)
			throw new Error("Invalid public origin");
		// 署名対象の origin は設定値から構築し、転送ヘッダーの自己申告を使わない。
		const target = new URL(incomingUrl);
		target.hash = "";
		// URL.search では失われる空クエリの末尾「?」も保持する。
		const requestTarget = target.href.slice(target.origin.length);
		const canonicalUrl = `${origin.origin}${requestTarget}`;
		const canonicalRequest = new Request(canonicalUrl, {
			method: request.method,
			headers: request.headers,
		});
		result = await detect(canonicalRequest);
	} catch {
		result = {
			status: "verification_error",
			reason: "request_verification_unavailable",
			signatureAgent:
				request.headers.get("signature-agent")?.slice(0, 256) ?? null,
			agentFormat: null,
			signatures: [],
			selectedSignature: null,
			replayProtection: "not_applicable",
		};
	}
	const variant = contentVariant(result);
	log({
		event: "ai_agent_detection",
		timestamp: new Date().toISOString(),
		requestId,
		method: request.method,
		path: incomingUrl.pathname.slice(0, 512),
		userAgent: request.headers.get("user-agent")?.slice(0, 256) ?? null,
		contentVariant: variant,
		...result,
	});
	return new Response(renderDetectionPage(result, requestId), {
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			"Cache-Control": "private, no-store, max-age=0",
			"X-Content-Variant": variant,
			"X-Request-Id": requestId,
			"X-Content-Type-Options": "nosniff",
			"Referrer-Policy": "no-referrer",
			"Content-Security-Policy":
				"default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
		},
	});
}

export function handleAgentDetectionRequest(request: Request) {
	return createDetectionResponse(request, {
		publicOrigin:
			process.env.AI_DETECTOR_PUBLIC_ORIGIN ?? process.env.BETTER_AUTH_URL,
	});
}
