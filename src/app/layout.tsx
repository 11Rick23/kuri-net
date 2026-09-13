import type { Metadata } from "next";
import { Jost, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import HomeIntro from "@/features/home/HomeIntro";
import Header from "@/shared/components/header/Header";
import PageTransition from "@/shared/components/motion/PageTransition";
import Providers from "./providers";

const jost = Jost({
	subsets: ["latin"],
	variable: "--font-jost",
	display: "swap",
});

const zenKaku = Zen_Kaku_Gothic_New({
	weight: ["400", "500", "700"],
	subsets: ["latin"],
	variable: "--font-zen",
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL("https://kuri-kuri.net"),
	title: {
		template: "%s | kuri-net",
		default: "kuri-net",
	},
	description: "kuri-kuriのウェブページ",
	openGraph: {
		title: "kuri-net",
		description:
			"kuri-kuriの制作実績、プロフィール、ウェブアプリをまとめた個人サイト",
		siteName: "kuri-net",
		type: "website",
		images: [
			{
				url: "/logo.png",
				width: 512,
				height: 512,
				alt: "kuri-net",
			},
		],
	},
	icons: {
		icon: [
			{
				url: "/favicon.ico",
				type: "image/x-icon",
				sizes: "16x16 32x32 48x48",
			},
			{
				url: "/logo.svg",
				type: "image/svg+xml",
				sizes: "any",
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="ja"
			className={`${jost.variable} ${zenKaku.variable}`}
			data-scroll-behavior="smooth"
			suppressHydrationWarning
		>
			<head />
			<body className="antialiased">
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-80 focus:rounded-md focus:border focus:border-ctp-blue focus:bg-ctp-base focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-ctp-text"
				>
					本文へ移動
				</a>
				<Providers>
					<HomeIntro>
						<Header />
						<PageTransition>{children}</PageTransition>
					</HomeIntro>
				</Providers>
			</body>
		</html>
	);
}
