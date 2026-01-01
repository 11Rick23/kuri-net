"use client";

import { useEffect, useState } from "react";
import { IoMdLogIn } from "react-icons/io";

export default function LogInButton() {
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
			aria-label="ログイン"
			onClick={() => {}}
			className="
				w-7 h-7 rounded-full cursor-pointer
				flex items-center justify-center
				hover:bg-gray-300 dark:hover:bg-gray-700
				"
		>
			<IoMdLogIn size={15} />
		</button>
	);
}
