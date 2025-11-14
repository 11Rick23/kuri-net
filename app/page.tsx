import type { Metadata } from "next";
import Header from "./components/header/wrapper";

export const metadata: Metadata = {
	title: "ホームページ",
};

export default function Home() {
	return (
		<main>
			<Header />
			<div className="flex items-center justify-center w-screen h-screen flex-col gap-10">
				<h1
					className="
				text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl
				animate-float
				"
				>
					ようこそ！
				</h1>
				<p
					className="
				text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 
				animate-float
				"
				>
					Welcome to kuri-kuri.net
				</p>
			</div>
		</main>
	);
}
