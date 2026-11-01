import type { WebBotVerifier } from "web-bot-auth";
import { verifierFromJWK } from "web-bot-auth/crypto";
import { DetectionError, isRecord } from "./types";

export const OPENAI_AGENT = "https://chatgpt.com";
export const OPENAI_DIRECTORY =
	"https://chatgpt.com/.well-known/http-message-signatures-directory";

const MAX_BYTES = 65_536;
const CACHE_MS = 300_000;
const REFRESH_INTERVAL_MS = 30_000;
const FAILURE_BACKOFF_MS = 15_000;

type PublicKey = JsonWebKey & {
	kid: string;
	nbf?: number;
	exp?: number;
};

type DirectoryFetch = (url: string, init: RequestInit) => Promise<Response>;
export type KeyResolver = (
	keyid: string,
	now: number,
) => Promise<WebBotVerifier>;

async function readDirectory(response: Response): Promise<unknown> {
	if (!response.ok || !response.body) {
		throw new DetectionError("key_directory_unavailable");
	}
	const length = Number(response.headers.get("content-length") ?? 0);
	if (!Number.isFinite(length) || length > MAX_BYTES) {
		await response.body.cancel();
		throw new DetectionError("key_directory_too_large");
	}
	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > MAX_BYTES) {
				await reader.cancel();
				throw new DetectionError("key_directory_too_large");
			}
			chunks.push(value);
		}
	} finally {
		reader.releaseLock();
	}
	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

function parseKeys(value: unknown): Map<string, PublicKey> {
	if (
		!isRecord(value) ||
		!Array.isArray(value.keys) ||
		value.keys.length === 0 ||
		value.keys.length > 32
	) {
		throw new DetectionError("invalid_key_directory");
	}
	const keys = new Map<string, PublicKey>();
	for (const entry of value.keys) {
		if (!isRecord(entry)) throw new DetectionError("invalid_key_directory");
		// 対応外の鍵を暗黙に別アルゴリズムとして解釈しない。
		if (entry.kty !== "OKP" || entry.crv !== "Ed25519") continue;
		if (
			typeof entry.kid !== "string" ||
			entry.kid.length > 256 ||
			typeof entry.x !== "string" ||
			!/^[A-Za-z0-9_-]{43}$/.test(entry.x) ||
			(entry.alg !== undefined && entry.alg !== "EdDSA") ||
			(entry.use !== undefined && entry.use !== "sig") ||
			entry.d !== undefined ||
			(entry.key_ops !== undefined &&
				(!Array.isArray(entry.key_ops) || !entry.key_ops.includes("verify"))) ||
			(entry.nbf !== undefined &&
				(typeof entry.nbf !== "number" || !Number.isSafeInteger(entry.nbf))) ||
			(entry.exp !== undefined &&
				(typeof entry.exp !== "number" || !Number.isSafeInteger(entry.exp))) ||
			keys.has(entry.kid)
		) {
			throw new DetectionError("invalid_key_directory");
		}
		keys.set(entry.kid, {
			kty: "OKP",
			crv: "Ed25519",
			x: entry.x,
			kid: entry.kid,
			nbf: typeof entry.nbf === "number" ? entry.nbf : undefined,
			exp: typeof entry.exp === "number" ? entry.exp : undefined,
		});
	}
	return keys;
}

export function createOpenAIKeyResolver({
	fetchDirectory = (url, init) => fetch(url, init),
	clock = Date.now,
}: {
	fetchDirectory?: DirectoryFetch;
	clock?: () => number;
} = {}): KeyResolver {
	let cache: Map<string, PublicKey> | undefined;
	let loadedAt = Number.NEGATIVE_INFINITY;
	let retryAfter = 0;
	let pending: Promise<void> | undefined;
	const verifiers = new Map<string, Promise<WebBotVerifier>>();

	async function refresh() {
		if (pending) return pending;
		if (clock() < retryAfter) {
			throw new DetectionError("key_directory_unavailable");
		}
		pending = (async () => {
			try {
				const response = await fetchDirectory(OPENAI_DIRECTORY, {
					redirect: "error",
					signal: AbortSignal.timeout(3_000),
					cache: "no-store",
					headers: {
						Accept: "application/http-message-signatures-directory+json",
					},
				});
				cache = parseKeys(await readDirectory(response));
				loadedAt = clock();
				verifiers.clear();
			} catch (error) {
				retryAfter = clock() + FAILURE_BACKOFF_MS;
				throw error instanceof DetectionError
					? error
					: new DetectionError("key_directory_unavailable");
			}
		})();
		try {
			await pending;
		} finally {
			pending = undefined;
		}
	}

	return async (keyid, now) => {
		if (!cache || clock() - loadedAt >= CACHE_MS) {
			await refresh();
		} else if (!cache.has(keyid) && clock() - loadedAt >= REFRESH_INTERVAL_MS) {
			await refresh();
		}
		const key = cache?.get(keyid);
		if (!key) throw new DetectionError("unknown_key");
		if (
			(key.nbf !== undefined && now < key.nbf) ||
			(key.exp !== undefined && now >= key.exp)
		) {
			throw new DetectionError("key_outside_validity");
		}
		let verifier = verifiers.get(keyid);
		if (!verifier) {
			verifier = verifierFromJWK(key)
				.catch(() => {
					throw new DetectionError("invalid_key_directory");
				})
				.then((resolved) => {
					if (resolved.keyid !== keyid) {
						throw new DetectionError("key_thumbprint_mismatch");
					}
					return resolved;
				});
			verifiers.set(keyid, verifier);
		}
		return verifier;
	};
}
