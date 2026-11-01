import { createHash } from "node:crypto";
import { DetectionError } from "./types";

export function createReplayCache(capacity = 10_000) {
	const entries = new Map<string, number>();
	return {
		consume(
			signer: string,
			keyid: string,
			nonce: string,
			expires: number,
			now: number,
		) {
			for (const [key, expiry] of entries) {
				if (expiry < now) entries.delete(key);
			}
			const fingerprint = createHash("sha256")
				.update(JSON.stringify([signer, keyid, nonce]))
				.digest("hex");
			if (entries.has(fingerprint)) {
				throw new DetectionError("replay_detected");
			}
			if (entries.size >= capacity) {
				throw new DetectionError("replay_cache_full");
			}
			// await を挟まず、検証後の確認と登録を同一プロセス内で不可分にする。
			entries.set(fingerprint, expires);
		},
	};
}
