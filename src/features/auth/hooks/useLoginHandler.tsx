"use client";

import { useRouter } from "next/navigation";
import login from "@/features/auth/client/login";
import RegistrationModalContent from "@/features/auth/components/RegistrationModal";
import { useModal } from "@/shared/components/modal/ModalProvider";
import { useToast } from "@/shared/components/toast/ToastProvider";

export default function useLoginHandler() {
	const { toast, dismiss } = useToast();
	const { openModal } = useModal();
	const router = useRouter();

	async function onLoginButtonPress() {
		// パスキー認証がブラウザでサポートされているか確認
		if (!("PublicKeyCredential" in window)) {
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
				dismiss("sign-up-notice");
				toast("ログインに成功しました。", {
					type: "success",
					durationMs: 10000,
					id: "login-success",
				});
				router.refresh();
			} else {
				toast(res.error, { type: "error", durationMs: 5000 });
			}
		} catch (error) {
			console.error("Login failed:", error);
		}
	}

	return { onLoginButtonPress };
}
