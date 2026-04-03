"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { MdDarkMode, MdSunny } from "react-icons/md";
import IconButton from "@/shared/components/button/IconButton";

function subscribe() {
	return () => {};
}

export default function ColorModeButton() {
	const { resolvedTheme, setTheme } = useTheme();
	const mounted = useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);

	if (!mounted) {
		return <div className="h-5 w-5 rounded-full bg-ctp-surface1" />;
	}

	const isDark = resolvedTheme === "dark";

	return (
		<IconButton
			ariaLabel="ダークモード切り替え"
			onClick={() => setTheme(isDark ? "light" : "dark")}
		>
			{isDark ? <MdSunny size={15} /> : <MdDarkMode size={15} />}
		</IconButton>
	);
}
