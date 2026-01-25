import { startRegistration } from "@simplewebauthn/browser";
import {
	generateRegistrationData,
	verifyRegistrationData,
} from "./registrationServerFunctions";

export default async function register(userName: string) {
	// チャレンジとユーザーIDを取得
	const options = await generateRegistrationData(userName);

	// パスキーの作成を開始
	const response = await startRegistration({ optionsJSON: options });

	// パスキーを検証
	const result = await verifyRegistrationData(response);

	alert(result?.verified ? "登録に成功しました！" : "登録に失敗しました。");
}
