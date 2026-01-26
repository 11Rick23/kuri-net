"use client";

import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import Link from "next/link";

import RegistrationModalContent from "@/components/auth/registrationModal";
import { useModal } from "@/components/modal/modalProvider";
import { useToast } from "@/components/toast/toastProvider";
import login from "@/functions/passkey/login";

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
				<Link
					href=""
					className="underline font-medium hover:text-blue-600 dark:hover:text-blue-400"
					onClick={() => {
						dismiss("sign-up-notice");
						openModal(<RegistrationModalContent />, { paddingSize: 6 });
					}}
				>
					こちら
				</Link>
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
				});
			} else {
				toast(res.error, { type: "error", durationMs: 10000 });
			}
		} catch (error) {
			console.error("Login failed:", error);
		}
	}

	return { onLoginButtonPress };
}
