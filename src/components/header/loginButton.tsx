"use client";

import { IoMdLogIn } from "react-icons/io";
import useLoginHandler from "@/hooks/useLoginHandler";

export default function LogInButton() {
	const { onLoginButtonPress } = useLoginHandler();

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
