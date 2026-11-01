import { describe, expect, test } from "bun:test";
import { verifySignature } from "http-message-sig";
import { verifierFromJWK } from "web-bot-auth/crypto";

describe("RFC 9421の独立したテストベクトル", () => {
	test("Appendix B.2.6のEd25519署名を検証する", async () => {
		// 機能要件：自前の署名生成だけでなくRFC公開の署名でも正規化と検証を確認する。
		// Given
		// https://www.rfc-editor.org/rfc/rfc9421.html#appendix-B.2.6
		const verifier = await verifierFromJWK({
			kty: "OKP",
			crv: "Ed25519",
			x: "JrQLj5P_89iXES9-vFgrIy29clF9CC_oPPsw3c5D0bs",
		});
		const request = new Request("https://example.com/foo?param=Value&Pet=dog", {
			method: "POST",
			headers: {
				date: "Tue, 20 Apr 2021 02:07:55 GMT",
				"content-type": "application/json",
				"content-length": "18",
				"signature-input":
					'sig-b26=("date" "@method" "@path" "@authority" "content-type" "content-length");created=1618884473;keyid="test-key-ed25519"',
				signature:
					"sig-b26=:wqcAqbmYJ2ji2glfAMaRy4gruYYnx2nEFN2HN6jrnDnQCK1u02Gb04v9EDgwUPiu4A0w6vuQv5lIp5WPpBKRCw==:",
			},
		});
		// When
		const result = await verifySignature(request, {
			policy: {
				algorithms: ["ed25519"],
				requiredComponents: ["@method", "@authority", "@path"],
				requiredParameters: ["created", "keyid"],
				now: 1_618_884_473,
			},
			resolveVerifier: () => verifier,
		});
		// Then
		expect(result.algorithm).toBe("ed25519");
		expect(result.label).toBe("sig-b26");
	});
});
