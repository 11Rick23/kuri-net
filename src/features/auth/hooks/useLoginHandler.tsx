"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useRef } from "react";
import login from "@/features/auth/client/login";
import RegistrationModalContent from "@/features/auth/components/RegistrationModal";
import { useModal } from "@/shared/components/modal/ModalProvider";
import { useToast } from "@/shared/components/toast/ToastProvider";

export default function useLoginHandler() {
	const { toast, dismiss } = useToast();
	const { openModal } = useModal();
	const router = useRouter();
	const loginButtonRef = useRef<HTMLButtonElement | null>(null);

	async function onLoginButtonPress(event: MouseEvent<HTMLButtonElement>) {
		loginButtonRef.current = event.currentTarget;

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
						openModal(<RegistrationModalContent />, {
							ariaLabel: "アカウント登録",
							paddingSize: 6,
							returnFocusFallback: () => loginButtonRef.current,
						});
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
		} catch {
			toast("ログインに失敗しました。しばらくしてから再度お試しください。", {
				type: "error",
				durationMs: 5000,
				id: "login-error",
			});
		}
	}

	return { onLoginButtonPress };
}
