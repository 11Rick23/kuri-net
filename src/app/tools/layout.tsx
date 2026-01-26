"use server";

import { BsShieldFillExclamation } from "react-icons/bs";
import login from "@/functions/passkey/login";
import { verifySession } from "@/functions/passkey/verifySession";

export default async function ToolsLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await verifySession();

	return session?.userID ? (
		// biome-ignore lint/complexity/noUselessFragments: これが無いとエラーになる
		<>{children}</>
	) : (
		<div className="flex items-center justify-center w-screen h-screen flex-col gap-10">
			<h1
				className="
                absolute
                text-[clamp(0rem,30vw,40rem)]
                font-bold blur-xl
                text-black/7 dark:text-white/5
                select-none pointer-events-none
                "
			>
				AUTH
			</h1>
			<BsShieldFillExclamation className="text-[clamp(48px,24vw,200px)] text-black dark:text-white" />
			<p className="text-[clamp(12px,8vw,80px)]">Authentication Required</p>
			<p className="text-[clamp(12px,4vw,30px)] text-center">
				このページへアクセスするには、
				<br className="sm:hidden" />
				ログインが必要です。
			</p>
			<button
				type="button"
				onClick={login}
				className="rounded-md px-5 py-2 mt-10
                        hover:bg-green-800/10 dark:hover:bg-green-800/30
                        border-2 border-black dark:border-white
                        font-semibold text-black dark:text-white
                        cursor-pointer"
			>
				ログイン
			</button>
		</div>
	);
}
