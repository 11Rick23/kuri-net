"use client";

import { BsShieldFillExclamation } from "react-icons/bs";
import useLoginHandler from "@/features/auth/hooks/useLoginHandler";

export default function AuthRequired() {
	const { onLoginButtonPress } = useLoginHandler();

	return (
		<div className="flex items-center justify-center w-screen h-screen flex-col gap-10">
			<h1
				className="
                    absolute
                    text-[clamp(0rem,40vw,40rem)]
                    font-bold blur-sm
                    text-ctp-lavender/10
                    select-none pointer-events-none
                    "
			>
				401
			</h1>
			<BsShieldFillExclamation className="text-[clamp(48px,24vw,200px)] text-ctp-blue-600" />
			<p className="text-[clamp(12px,8vw,80px)]">Authentication Required</p>
			<p className="text-[clamp(12px,4vw,30px)] text-center">
				このページへアクセスするには、
				<br className="sm:hidden" />
				ログインが必要です。
			</p>
			<button
				type="button"
				onClick={onLoginButtonPress}
				className="rounded-md px-5 py-2 mt-10
							bg-ctp-blue
                            hover:opacity-90
                            border border-ctp-blue
                            font-semibold text-ctp-crust
                            cursor-pointer"
			>
				ログイン
			</button>
		</div>
	);
}
