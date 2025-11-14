"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MdDarkMode, MdSunny } from "react-icons/md";

export default function ColorModeButton() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="w-5 h-5 rounded-full bg-gray-800" />;
	}

	return (
		<button
			type="button"
			aria-label="ダークモード切り替え"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className="
				w-7 h-7 rounded-full cursor-pointer
				flex items-center justify-center
				hover:bg-gray-300 hover:dark:bg-gray-700
				"
		>
			{theme === "dark" ? <MdSunny size={15} /> : <MdDarkMode size={15} />}
		</button>
	);
}
