export type DetectionStatus =
	| "verified_openai"
	| "verified_test_agent"
	| "unsigned"
	| "invalid_signature"
	| "unknown_signer"
	| "verification_error";

export type SignatureObservation = {
	label: string;
	components: string[];
	keyid: string | null;
	algorithm: string | null;
	created: number | null;
	expires: number | null;
	tag: string | null;
	noncePresent: boolean;
	authenticated: boolean;
};

export type DetectionResult = {
	status: DetectionStatus;
	reason: string;
	signatureAgent: string | null;
	agentFormat: "legacy" | "dictionary" | null;
	signatures: SignatureObservation[];
	selectedSignature: string | null;
	replayProtection: "nonce" | "unavailable" | "not_applicable";
};

export class DetectionError extends Error {
	constructor(readonly reason: string) {
		super(reason);
		this.name = "DetectionError";
	}
}

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
