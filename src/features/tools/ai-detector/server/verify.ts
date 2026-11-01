import { component, isSignatureError, verifySignature } from "http-message-sig";
import { parseDictionary, parseItem, serializeItem } from "structured-headers";
import type { KeyResolver } from "./keyDirectory";
import { createReplayCache } from "./replayCache";
import {
	DetectionError,
	type DetectionResult,
	type SignatureObservation,
} from "./types";

const MAX_HEADER_LENGTH = 8_192;
const MAX_SIGNATURE_AGE = 86_400;
const CLOCK_SKEW = 30;

const timeFailureReasons: Record<string, string> = {
	"Signature was created in the future": "signature_created_in_future",
	"Signature has expired": "signature_expired",
	"Signature is too old": "signature_too_old",
};

export type TrustedSigner = {
	agents: readonly string[];
	status: "verified_openai" | "verified_test_agent";
	resolveKey: KeyResolver;
};

function stringParameter(value: unknown) {
	return typeof value === "string" ? value.slice(0, 256) : null;
}

function numberParameter(value: unknown) {
	return typeof value === "number" && Number.isSafeInteger(value)
		? value
		: null;
}

function readInputs(header: string): SignatureObservation[] {
	const inputs = parseDictionary(header);
	if (inputs.size === 0 || inputs.size > 4) {
		throw new DetectionError("invalid_signature_input");
	}
	return Array.from(inputs, ([label, [items, parameters]]) => {
		if (!Array.isArray(items) || items.length > 16) {
			throw new DetectionError("invalid_signature_input");
		}
		return {
			label,
			components: items.map((item) => serializeItem(item)),
			keyid: stringParameter(parameters.get("keyid")),
			algorithm: stringParameter(parameters.get("alg")),
			created: numberParameter(parameters.get("created")),
			expires: numberParameter(parameters.get("expires")),
			tag: stringParameter(parameters.get("tag")),
			noncePresent: parameters.has("nonce"),
			authenticated: false,
		};
	});
}

function readAgents(header: string) {
	if (header.trimStart().startsWith('"')) {
		const [agent, parameters] = parseItem(header);
		if (typeof agent !== "string" || parameters.size !== 0) {
			throw new DetectionError("invalid_signature_agent");
		}
		return { format: "legacy" as const, agents: new Map([["", agent]]) };
	}
	const dictionary = parseDictionary(header);
	const agents = new Map<string, string>();
	for (const [label, [agent, parameters]] of dictionary) {
		// -01 の規則に従い、パラメーター付き辞書メンバーを採用しない。
		if (parameters.size !== 0) continue;
		if (typeof agent !== "string") {
			throw new DetectionError("invalid_signature_agent");
		}
		agents.set(label, agent);
	}
	return { format: "dictionary" as const, agents };
}

function failure(error: unknown): {
	status: "invalid_signature" | "verification_error";
	reason: string;
} {
	const issue =
		isSignatureError(error) && error.cause instanceof DetectionError
			? error.cause
			: error;
	if (issue instanceof DetectionError) {
		return {
			status:
				issue.reason.startsWith("key_directory") ||
				issue.reason === "invalid_key_directory" ||
				issue.reason === "key_thumbprint_mismatch" ||
				issue.reason === "replay_cache_full"
					? "verification_error"
					: "invalid_signature",
			reason: issue.reason,
		};
	}
	return {
		status: isSignatureError(error)
			? "invalid_signature"
			: "verification_error",
		reason: isSignatureError(error)
			? (timeFailureReasons[error.message] ?? error.code)
			: "verification_failed",
	};
}

export function createAgentDetector({
	trustedSigners,
	clock = Date.now,
	replayCache = createReplayCache(),
}: {
	trustedSigners: readonly TrustedSigner[];
	clock?: () => number;
	replayCache?: ReturnType<typeof createReplayCache>;
}) {
	return async (request: Request): Promise<DetectionResult> => {
		const signature = request.headers.get("signature");
		const input = request.headers.get("signature-input");
		const agent = request.headers.get("signature-agent");
		const result: DetectionResult = {
			status: "unsigned",
			reason: "no_signature",
			signatureAgent: agent === null ? null : agent.slice(0, 256),
			agentFormat: null,
			signatures: [],
			selectedSignature: null,
			replayProtection: "not_applicable",
		};
		if (signature === null && input === null && agent === null) return result;
		if (!signature || !input || !agent) {
			return {
				...result,
				status: "invalid_signature",
				reason: "incomplete_signature",
			};
		}
		if (
			[signature, input, agent].some(
				(value) => value.length > MAX_HEADER_LENGTH,
			)
		) {
			return {
				...result,
				status: "invalid_signature",
				reason: "signature_headers_too_large",
			};
		}
		let parsedAgents: ReturnType<typeof readAgents>;
		try {
			result.signatures = readInputs(input);
			parsedAgents = readAgents(agent);
			result.agentFormat = parsedAgents.format;
		} catch {
			return {
				...result,
				status: "invalid_signature",
				reason: "malformed_signature_headers",
			};
		}
		const now = Math.floor(clock() / 1_000);
		let matched = false;
		let lastFailure = failure(new DetectionError("invalid_signature_agent"));
		for (const observation of result.signatures) {
			const signerAgent = parsedAgents.agents.get(
				parsedAgents.format === "legacy" ? "" : observation.label,
			);
			const signer = trustedSigners.find((entry) =>
				entry.agents.some((identity) => identity === signerAgent),
			);
			if (!signer || !signerAgent) continue;
			matched = true;
			try {
				const verified = await verifySignature(request, {
					label: observation.label,
					policy: {
						algorithms: ["ed25519"],
						requiredComponents: [
							parsedAgents.format === "legacy"
								? "signature-agent"
								: component("signature-agent", { key: observation.label }),
						],
						requiredParameters: ["created", "expires", "keyid", "tag"],
						maxAge: MAX_SIGNATURE_AGE,
						clockSkew: CLOCK_SKEW,
						now,
					},
					resolveVerifier(candidate) {
						const { created, expires, keyid, tag, nonce } =
							candidate.parameters;
						if (
							tag !== "web-bot-auth" ||
							typeof keyid !== "string" ||
							keyid.length === 0 ||
							keyid.length > 256 ||
							typeof created !== "number" ||
							typeof expires !== "number" ||
							expires <= created ||
							expires - created > MAX_SIGNATURE_AGE ||
							(nonce !== undefined &&
								(typeof nonce !== "string" ||
									nonce.length === 0 ||
									nonce.length > 256)) ||
							!candidate.components.some(
								({ name, parameters }) =>
									(name === "@authority" || name === "@target-uri") &&
									Object.keys(parameters).length === 0,
							)
						) {
							throw new DetectionError("signature_policy_rejected");
						}
						return signer.resolveKey(keyid, now);
					},
				});
				observation.authenticated = true;
				observation.algorithm = verified.algorithm;
				const { nonce, expires, keyid } = verified.parameters;
				if (
					typeof nonce === "string" &&
					typeof expires === "number" &&
					typeof keyid === "string"
				) {
					replayCache.consume(
						signer.agents[0],
						keyid,
						nonce,
						expires + CLOCK_SKEW,
						now,
					);
					result.replayProtection = "nonce";
				} else {
					result.replayProtection = "unavailable";
				}
				return {
					...result,
					status: signer.status,
					reason: "signature_verified",
					selectedSignature: observation.label,
				};
			} catch (error) {
				lastFailure = failure(error);
			}
		}
		return matched
			? { ...result, ...lastFailure }
			: {
					...result,
					status: "unknown_signer",
					reason: "untrusted_signature_agent",
				};
	};
}
