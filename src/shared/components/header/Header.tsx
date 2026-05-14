"use server";

import { verifySession } from "@/features/auth/server/verifySession";
import ColorModeButton from "./ColorModeButton";
import HomeButton from "./HomeButton";
import LogInButton from "./LoginButton";
import LogOutButton from "./LogoutButton";
import PageButton from "./PageButton";

function Border() {
	return (
		<div className="h-4 w-4 px-2">
			<div className="mx-auto h-full w-px bg-ctp-surface1" />
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
            m-2 px-2 py-1 gap-1 rounded-lg
            bg-ctp-base/90 text-ctp-text
            border border-ctp-surface1
            backdrop-blur-md
            "
			>
				<HomeButton />
				<Border />
				<PageButton url="/about" display="About" />
				<PageButton url="/works" display="Works" />
				<PageButton url="/tools" display="Tools" match="prefix" />
				<Border />
				<ColorModeButton />
				{session?.userID ? <LogOutButton /> : <LogInButton />}
			</div>
		</div>
	);
}
