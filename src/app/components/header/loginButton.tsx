"use client";

import { IoMdLogIn } from "react-icons/io";
import { useToast } from "@/components/toast/toastProvider";

export default function LogInButton() {
	const { toast } = useToast();

	return (
		<button
			type="button"
			aria-label="ログイン"
			onClick={() =>
				toast("ログイン機能はまだ実装されていません", {
					type: "info",
					durationMs: 3000,
				})
			}
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
