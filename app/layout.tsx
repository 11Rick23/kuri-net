import type { Metadata } from "next";
import { M_PLUS_1 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const mPlus1 = M_PLUS_1({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		template: "%s | kuri-net",
		default: "kuri-net",
	},
	description: "kuri-kuriのウェブページ",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="ja" suppressHydrationWarning>
			<head />
			<body className={`${mPlus1.className} antialiased`}>
				<ThemeProvider attribute="class">{children}</ThemeProvider>
			</body>
		</html>
	);
}
