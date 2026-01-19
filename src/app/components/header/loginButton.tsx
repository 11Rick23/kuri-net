"use client";

import Link from "next/link";

import { IoMdLogIn } from "react-icons/io";
import { useModal } from "@/app/components/modal/modalProvider";
import RegistrationModalContent from "@/app/components/registration/registrationModal";
import { useToast } from "@/app/components/toast/toastProvider";

export default function LogInButton() {
	const { toast, dismiss } = useToast();
	const { openModal } = useModal();

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

	return (
		<button
			type="button"
			aria-label="ログイン"
			onClick={() => {
				toast(message, {
					id: "sign-up-notice",
					type: "info",
					durationMs: 20000,
				});
			}}
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
