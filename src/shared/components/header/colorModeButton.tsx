"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MdDarkMode, MdSunny } from "react-icons/md";
import IconButton from "@/shared/components/button/IconButton";

export default function ColorModeButton() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="w-5 h-5 rounded-full bg-gray-800" />;
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
