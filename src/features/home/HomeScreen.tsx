import { verifySession } from "@/features/auth/server/verifySession";
import LiveClock from "@/shared/components/liveClock";

export default async function HomeScreen() {
	const session = await verifySession();

	const loggedOutContent = {
		title: "こんにちは！",
		description: (
			<>
				kuri-kuri.net へようこそ。
				<br />
				ヘッダーの一番右にあるログインボタンから
				<br />
				アカウントの登録やログインができます。
			</>
		),
	};

	const loggedInContent = {
		title: "お帰りなさい！",
		description: <LiveClock />,
	};

	return (
		<main>
			<div className="flex items-center justify-center w-screen h-screen flex-col gap-10">
				<h1 className="text-[clamp(0rem,10vw,30rem)] text-center animate-float">
					{session?.userID ? loggedInContent.title : loggedOutContent.title}
				</h1>
				<p className="text-[clamp(0rem,3vw,10rem)] text-center">
					{session?.userID
						? loggedInContent.description
						: loggedOutContent.description}
				</p>
			</div>
		</main>
	);
}
