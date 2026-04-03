"use client";

import { ThemeProvider } from "next-themes";
import type React from "react";
import { ModalProvider } from "@/shared/components/modal/modalProvider";
import { ToastProvider } from "@/shared/components/toast/toastProvider";

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
			<ToastProvider>
				<ModalProvider>{children}</ModalProvider>
			</ToastProvider>
		</ThemeProvider>
	);
}
