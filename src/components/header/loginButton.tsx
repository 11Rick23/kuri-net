"use client";

import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import Link from "next/link";
import { IoMdLogIn } from "react-icons/io";
import login from "@/app/functions/passkey/login";
import { useModal } from "@/components/modal/modalProvider";
import RegistrationModalContent from "@/components/registration/registrationModal";
import { useToast } from "@/components/toast/toastProvider";

export default function LogInButton() {
	const { toast, dismiss } = useToast();
	const { openModal } = useModal();

	async function onLoginButtonPress() {
		// パスキー認証がブラウザでサポートされているか確認
		if (!browserSupportsWebAuthn()) {
			const message = (
				<>
					{
						"ご利用中のブラウザはパスキー認証（WebAuthn）に対応していません。別のブラウザをご利用ください。"
					}
				</>
			);
			toast(message, { type: "error", durationMs: 5000 });
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

		await login();
	}

	return (
		<button
			type="button"
			aria-label="ログイン"
			onClick={onLoginButtonPress}
			className="
				w-7 h-7 rounded-full cursor-pointer
				flex items-center justify-center
				hover:bg-gray-300 dark:hover:bg-gray-700
				"
		>
			<IoMdLogIn size={15} />
		</button>
	);
}
