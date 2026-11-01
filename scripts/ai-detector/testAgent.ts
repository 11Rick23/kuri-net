import {
	appendSignature,
	component,
	createSignature,
	type SignatureComponent,
} from "http-message-sig";
import { generateNonce } from "web-bot-auth";
import { signerFromJWK, verifierFromJWK } from "web-bot-auth/crypto";
import { DetectionError } from "../../src/features/tools/ai-detector/server/types";
import type { TrustedSigner } from "../../src/features/tools/ai-detector/server/verify";

export const TEST_AGENT = "https://local-test-agent.invalid";

export async function createTestAgent() {
	const keys = await crypto.subtle.generateKey("Ed25519", true, [
		"sign",
		"verify",
	]);
	const signer = await signerFromJWK({
		...(await crypto.subtle.exportKey("jwk", keys.privateKey)),
		alg: "EdDSA",
	});
	const publicJwk = {
		...(await crypto.subtle.exportKey("jwk", keys.publicKey)),
		alg: "EdDSA",
		kid: signer.keyid,
	};
	const verifier = await verifierFromJWK(publicJwk);
	const trustedSigner: TrustedSigner = {
		agents: [TEST_AGENT],
		status: "verified_test_agent",
		async resolveKey(keyid) {
			if (keyid !== verifier.keyid) throw new DetectionError("unknown_key");
			return verifier;
		},
	};

	return {
		publicJwk,
		trustedSigner,
		async sign(
			url: string,
			{
				now = Date.now(),
				created = Math.floor(now / 1_000),
				expires = created + 300,
				nonce = generateNonce(),
				agent = TEST_AGENT,
				format = "legacy",
				label = "test",
				keyid = signer.keyid,
				components,
				includeAlgorithm = true,
				tag = "web-bot-auth",
			}: {
				now?: number;
				created?: number;
				expires?: number;
				nonce?: string | null;
				agent?: string;
				format?: "legacy" | "dictionary";
				label?: string;
				keyid?: string;
				components?: readonly SignatureComponent[];
				includeAlgorithm?: boolean;
				tag?: string;
			} = {},
		) {
			const request = new Request(url, {
				headers: {
					"Signature-Agent":
						format === "legacy"
							? JSON.stringify(agent)
							: `${label}=${JSON.stringify(agent)}`,
					"User-Agent": "kuri-net-local-signature-test",
				},
			});
			const fields = await createSignature(request, {
				label,
				components: components ?? [
					"@method",
					"@target-uri",
					format === "legacy"
						? "signature-agent"
						: component("signature-agent", { key: label }),
				],
				parameters: {
					created,
					expires,
					keyid,
					nonce: nonce ?? undefined,
					alg: includeAlgorithm ? signer.algorithm : undefined,
					tag,
				},
				signer,
			});
			return new Request(url, {
				headers: appendSignature(request.headers, fields),
			});
		},
	};
}
