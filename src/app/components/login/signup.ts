import type { Result } from "@/utils/types";

export async function checkPasskeySupport(): Promise<Result<null, string>> {
	try {
		if (
			!window.PublicKeyCredential ||
			!PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ||
			!PublicKeyCredential.isConditionalMediationAvailable
		) {
			return {
				success: false,
				error: "WebAuthn is not supported in this browser",
			};
		}

		return {
			success: true,
			data: null,
		};
	} catch (error) {
		console.error("Error checking passkey support:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "An unknown error occurred",
		};
	}
}

export default function SignUp() {}
