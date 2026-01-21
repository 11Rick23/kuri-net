import { startRegistration } from "@simplewebauthn/browser";
import { cookies } from "next/headers";
import { generateRegistrationData } from "./registrationServerFunctions";

export default async function register(userName: string) {
	// チャレンジとユーザーIDを取得
	const { options, sessionId } = await generateRegistrationData(userName);

	// セッションIDをクッキーに保存
	const cookieStore = await cookies();
	cookieStore.set("sessionId", sessionId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 1000 * 60 * 60 * 24 * 30, // 最大30日間有効
	});

	// パスキーの作成を開始
	const response = await startRegistration({ optionsJSON: options });

	alert("パスキーの登録が完了しました！");
}
