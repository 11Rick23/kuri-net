"use client";

import { BsShieldFillExclamation } from "react-icons/bs";
import useLoginHandler from "@/features/auth/hooks/useLoginHandler";

export default function AuthRequired({
	fullscreen = true,
}: {
	fullscreen?: boolean;
}) {
	const { onLoginButtonPress } = useLoginHandler();

	return (
		<div
			className={[
				"relative flex items-center justify-center flex-col",
				fullscreen
					? "w-screen h-screen gap-10"
					: "min-h-[calc(100vh-8rem)] w-full gap-8 rounded-2xl border border-ctp-surface1 bg-ctp-base p-8 text-center shadow-light dark:shadow-dark",
			].join(" ")}
		>
			{fullscreen && (
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
			)}
			<BsShieldFillExclamation
				className={
					fullscreen
						? "text-[clamp(48px,24vw,200px)] text-ctp-blue-600"
						: "text-7xl text-ctp-blue-600"
				}
			/>
			<p
				className={
					fullscreen
						? "text-[clamp(12px,8vw,80px)]"
						: "text-3xl font-bold text-ctp-text"
				}
			>
				Authentication Required
			</p>
			<p
				className={
					fullscreen
						? "text-[clamp(12px,4vw,30px)] text-center"
						: "max-w-xl text-base leading-7 text-ctp-subtext1"
				}
			>
				このページへアクセスするには、
				<br className="sm:hidden" />
				ログインが必要です。
			</p>
			<button
				type="button"
				onClick={onLoginButtonPress}
				className="rounded-md px-5 py-2
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
