"use client";

import { ThemeProvider } from "next-themes";
import type React from "react";
import { ModalProvider } from "@/shared/components/modal/ModalProvider";
import FaviconSync from "@/shared/components/theme/FaviconSync";
import { ToastProvider } from "@/shared/components/toast/ToastProvider";

export default function Providers({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
			value={{ light: "latte", dark: "macchiato" }}
		>
			<FaviconSync />
			<ToastProvider>
				<ModalProvider>{children}</ModalProvider>
			</ToastProvider>
		</ThemeProvider>
	);
}
