"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { generateLoginOptions } from "./loginServerFunctions";

export default async function login() {
	const optionsJSON = await generateLoginOptions();

	const result = await startAuthentication({ optionsJSON });
}
