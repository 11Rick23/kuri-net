"use client";

import { IoMdLogOut } from "react-icons/io";
import useLogoutHandler from "@/hooks/useLogoutHandler";

export default function LogOutButton() {
	const { onLogoutButtonPress } = useLogoutHandler();

	return (
		<button
			type="button"
			aria-label="ログアウト"
			onClick={onLogoutButtonPress}
			className="
                w-7 h-7 rounded-full cursor-pointer
                flex items-center justify-center
                hover:bg-gray-300 dark:hover:bg-gray-700
                "
		>
			<IoMdLogOut size={15} />
		</button>
	);
}
