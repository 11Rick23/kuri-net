"use server";

import { verifySession } from "@/features/auth/server/verifySession";
import ColorModeButton from "./colorModeButton";
import HomeButton from "./homeButton";
import LogInButton from "./loginButton";
import LogOutButton from "./logoutButton";
import PageButton from "./pageButton";

function Border() {
	return (
		<div className="h-4 w-4 px-2">
			<div className="mx-auto h-full w-px bg-gray-400 dark:bg-gray-600" />
		</div>
	);
}

export default async function Header() {
	const session = await verifySession();

	return (
		<div className="fixed top-0 left-0 w-full flex items-center justify-center z-70">
			<div
				className="
            inline-flex items-center justify-center
            m-2 px-2 py-1 gap-1 rounded-full
            bg-white/60 dark:bg-black/60
            border border-gray-400 dark:border-gray-600
            backdrop-blur-md shadow-light dark:shadow-dark
            "
			>
				<HomeButton />
				<Border />
				<PageButton url="/about" display="About" />
				<PageButton url="/tools/pdf-merge" display="Tools" />
				<Border />
				<ColorModeButton />
				{session?.userID ? <LogOutButton /> : <LogInButton />}
			</div>
		</div>
	);
}
