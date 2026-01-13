import { checkPasskeySupport } from "./checkPasskeySupport";
import { generateRegistrationData } from "./generateRegistrationData";

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
	const { encodedChallenge, userId } = await generateRegistrationData();
	const challenge = base64urlToUint8Array(encodedChallenge);

	// パスキーの作成を開始
	try {
		const credentials = await navigator.credentials.create({
			publicKey: {
				challenge: challenge,
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
		if (!isPublicKeyCredential(credentials)) {
			alert("パスキーの作成に失敗しました。");
			console.error("クレデンシャルが取得できませんでした。");
			return;
		}

		console.log("パスキーの作成に成功しました: \n", credentials.id);
	} catch (error) {
		alert("パスキーの作成中にエラーが発生しました。");
		console.error("パスキーの作成エラー:", error);
		return;
	}
}

function base64urlToUint8Array(base64url: string) {
	let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
	const pad = base64.length % 4;
	if (pad) base64 += "=".repeat(4 - pad);

	const bin = atob(base64);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return bytes;
}

function isPublicKeyCredential(x: unknown): x is PublicKeyCredential {
	return (
		typeof x === "object" &&
		x !== null &&
		"type" in x &&
		(x as Record<string, unknown>).type === "public-key" &&
		"rawId" in x
	);
}
