"use client";

import { IoMdLogOut } from "react-icons/io";
import useLogoutHandler from "@/features/auth/hooks/useLogoutHandler";
import IconButton from "@/shared/components/button/IconButton";

export default function LogOutButton() {
	const { onLogoutButtonPress } = useLogoutHandler();

	return (
		<IconButton ariaLabel="ログアウト" onClick={onLogoutButtonPress}>
			<IoMdLogOut size={15} />
		</IconButton>
	);
}
