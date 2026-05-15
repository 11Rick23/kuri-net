"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const faviconByTheme = {
	light: "/favicon/kuri-net-peach-light.png",
	dark: "/favicon/kuri-net-peach-dark.png",
} as const;

export default function FaviconSync() {
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		if (resolvedTheme !== "light" && resolvedTheme !== "dark") {
			return;
		}

		document.head
			.querySelectorAll<HTMLLinkElement>(
				'link[rel="icon"][data-theme-favicon="active"]',
			)
			.forEach((link) => {
				link.remove();
			});

		const faviconLink = document.createElement("link");
		faviconLink.rel = "icon";
		faviconLink.type = "image/png";
		faviconLink.dataset.themeFavicon = "active";
		faviconLink.href = faviconByTheme[resolvedTheme];
		document.head.append(faviconLink);
	}, [resolvedTheme]);

	return null;
}
