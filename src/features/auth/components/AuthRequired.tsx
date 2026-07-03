"use client";

import useLoginHandler from "@/features/auth/hooks/useLoginHandler";
import FullscreenMessage from "@/shared/components/layout/FullscreenMessage";

export default function AuthRequired({
	fullscreen = true,
}: {
	fullscreen?: boolean;
}) {
	const { onLoginButtonPress } = useLoginHandler();
	const loginButton = (
		<button
			type="button"
			onClick={onLoginButtonPress}
			className="cursor-pointer rounded-md border border-ctp-blue bg-ctp-blue px-5 py-2 text-sm font-semibold text-ctp-crust transition duration-200 hover:bg-ctp-sapphire active:scale-[0.98]"
		>
			ログイン
		</button>
	);
	const description = (
		<>
			このページへアクセスするには、
			<br className="sm:hidden" />
			ログインが必要です。
		</>
	);

	if (fullscreen) {
		return (
			<FullscreenMessage
				backgroundLabel="401"
				title="Authentication Required"
				description={description}
				actions={loginButton}
			/>
		);
	}

	return (
		<FullscreenMessage
			backgroundLabel="401"
			title="Authentication Required"
			description={description}
			actions={loginButton}
			className="-mt-20 min-h-dvh"
		/>
	);
}
