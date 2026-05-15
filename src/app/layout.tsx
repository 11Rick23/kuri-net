import type { Metadata } from "next";
import { M_PLUS_1 } from "next/font/google";
import "./globals.css";
import Header from "@/shared/components/header/Header";
import Providers from "./providers";

const mPlus1 = M_PLUS_1({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		template: "%s | kuri-net",
		default: "kuri-net",
	},
	description: "kuri-kuriのウェブページ",
	icons: {
		icon: [
			{
				url: "/favicon/kuri-net-peach-light.png",
				type: "image/png",
				media: "(prefers-color-scheme: light)",
			},
			{
				url: "/favicon/kuri-net-peach-dark.png",
				type: "image/png",
				media: "(prefers-color-scheme: dark)",
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="ja" suppressHydrationWarning>
			<head />
			<body
				className={`${mPlus1.className} antialiased transition-colors duration-150`}
			>
				<Providers>
					<Header />
					{children}
				</Providers>
			</body>
		</html>
	);
}
