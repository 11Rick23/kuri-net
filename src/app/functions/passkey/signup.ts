import { checkPasskeySupport } from "./checkPasskeySupport";
import { generateChallenge, generateUserId } from "./server";

export default async function signUp(userName: string) {
	// パスキーがサポートされているか確認
	const checkPasskeySupportResult = await checkPasskeySupport();
	if (!checkPasskeySupportResult.success) {
		console.error("checkPasskeySupportResult:", checkPasskeySupportResult);
		alert(
			`お使いのブラウザはパスキーに対応していません。\n\n理由: ${checkPasskeySupportResult.error}`,
		);
		return;
	}
	console.log("パスキーはサポートされているようです。");

	// チャレンジとユーザーIDを取得
	const encodedChallenge = await generateChallenge();
	const challenge = Buffer.from(encodedChallenge, "base64url");
	const userId = await generateUserId();

	// パスキーの作成を開始
	navigator.credentials.create({
		publicKey: {
			challenge: new Uint8Array(challenge),
			rp: { name: "kuri-net" },
			user: {
				id: new TextEncoder().encode(userId),
				name: userName,
				displayName: userName,
			},
			pubKeyCredParams: [
				{ type: "public-key", alg: -8 }, // Ed25519
				{ type: "public-key", alg: -7 }, // ES256
				{ type: "public-key", alg: -257 }, // RS256
			],
		},
	});
}
