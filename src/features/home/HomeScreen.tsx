import Link from "next/link";
import { getAuthenticatedSession } from "@/features/auth/server/session";
import LiveClock from "@/shared/components/LiveClock";
import FullscreenMessage from "@/shared/components/layout/FullscreenMessage";

const homeLinks = [
	{ href: "/profile", label: "Profile" },
	{ href: "/works", label: "Works" },
	{ href: "/apps", label: "Apps" },
];

export default async function HomeScreen() {
	const session = await getAuthenticatedSession();

	const loggedOutContent = {
		title: "こんにちは",
		description: (
			<>
				kuri-kuri.net へようこそ。
				<br />
				プロフィール、制作実績、ウェブアプリなどをまとめています。
			</>
		),
	};

	const loggedInContent = {
		title: "お帰りなさい",
		description: <LiveClock />,
	};

	return (
		<main>
			<FullscreenMessage
				title={session ? loggedInContent.title : loggedOutContent.title}
				description={
					session ? loggedInContent.description : loggedOutContent.description
				}
				actions={homeLinks.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className="inline-flex w-24 items-center justify-center rounded-md border border-ctp-surface1 bg-ctp-base/80 px-4 py-2.5 text-sm font-semibold text-ctp-text backdrop-blur-md transition duration-200 hover:border-ctp-blue/50 hover:bg-ctp-mantle active:scale-[0.98]"
					>
						{link.label}
					</Link>
				))}
			/>
		</main>
	);
}
