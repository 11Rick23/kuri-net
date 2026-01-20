import { startRegistration } from "@simplewebauthn/browser";
import { generateRegistrationData } from "./registrationServerFunctions";

export default async function register(userName: string) {
	// チャレンジとユーザーIDを取得
	const options = await generateRegistrationData(userName);

	// パスキーの作成を開始
	const response = await startRegistration({ optionsJSON: options });

	alert("パスキーの登録が完了しました！");
}
