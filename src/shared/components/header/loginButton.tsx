"use client";

import { IoMdLogIn } from "react-icons/io";
import useLoginHandler from "@/features/auth/hooks/useLoginHandler";
import IconButton from "@/shared/components/button/IconButton";

export default function LogInButton() {
	const { onLoginButtonPress } = useLoginHandler();

	return (
		<IconButton ariaLabel="ログイン" onClick={onLoginButtonPress}>
			<IoMdLogIn size={15} />
		</IconButton>
	);
}
