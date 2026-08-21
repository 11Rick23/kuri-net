import type { Metadata } from "next";
import { M_PLUS_1 } from "next/font/google";
import "./globals.css";
import Header from "@/shared/components/header/Header";
import Providers from "./providers";

const mPlus1 = M_PLUS_1({
	subsets: ["latin"],
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
			"kuri-kuriの制作実績、プロフィール、便利ツールをまとめた個人サイト",
		siteName: "kuri-net",
		type: "website",
		images: [
			{
				url: "/favicon/kuri-net-peach-light.webp",
				alt: "kuri-net",
			},
		],
	},
	icons: {
		icon: [
			{
				url: "/favicon/kuri-net-peach-light.webp",
				type: "image/webp",
				media: "(prefers-color-scheme: light)",
			},
			{
				url: "/favicon/kuri-net-peach-dark.webp",
				type: "image/webp",
				media: "(prefers-color-scheme: dark)",
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="ja" data-scroll-behavior="smooth" suppressHydrationWarning>
			<head />
			<body
				className={`${mPlus1.className} antialiased transition-colors duration-150`}
			>
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-80 focus:rounded-md focus:border focus:border-ctp-blue focus:bg-ctp-base focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-ctp-text"
				>
					本文へ移動
				</a>
				<Providers>
					<Header />
					<div id="main-content">{children}</div>
				</Providers>
			</body>
		</html>
	);
}
