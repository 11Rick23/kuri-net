"use client";

import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import login from "@/features/auth/client/login";
import RegistrationModalContent from "@/features/auth/components/registrationModal";
import { useModal } from "@/shared/components/modal/modalProvider";
import { useToast } from "@/shared/components/toast/toastProvider";

export default function useLoginHandler() {
	const { toast, dismiss } = useToast();
	const { openModal } = useModal();

	async function onLoginButtonPress() {
		// パスキー認証がブラウザでサポートされているか確認
		if (!browserSupportsWebAuthn()) {
			toast(
				"ご利用中のブラウザはパスキー認証（WebAuthn）に対応していません。別のブラウザをご利用ください。",
				{ type: "error", durationMs: 5000 },
			);
			return;
		}

		// 登録を促すトーストのメッセージ
		const message = (
			<>
				{"新規アカウント登録は "}
				<button
					type="button"
					className="cursor-pointer font-medium underline hover:text-ctp-blue"
					onClick={() => {
						dismiss("sign-up-notice");
						openModal(<RegistrationModalContent />, { paddingSize: 6 });
					}}
				>
					こちら
				</button>
			</>
		);

		// トーストを送信
		toast(message, {
			id: "sign-up-notice",
			type: "info",
			durationMs: 20000,
		});

		// ログイン処理を実行
		try {
			const res = await login();

			if (res.ok) {
				toast("ログインに成功しました。", {
					type: "success",
					durationMs: 10000,
					id: "login-success",
				});
			} else {
				console.log(res.error);
			}
		} catch (error) {
			console.error("Login failed:", error);
		}
	}

	return { onLoginButtonPress };
}
