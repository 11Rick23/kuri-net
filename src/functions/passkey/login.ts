"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { generateLoginOptions, verifyLoginData } from "./loginServerFunctions";

export default async function login() {
	const optionsJSON = await generateLoginOptions();

	const result = await startAuthentication({ optionsJSON });

	await verifyLoginData(result);

	alert("ログインに成功しました！");
}
