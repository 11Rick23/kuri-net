"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome } from "react-icons/fa";

export default function HomeButton() {
	const pathname = usePathname();
	const isActive = pathname === "/";

	return (
		<Link
			href="/"
			type="button"
			aria-label="ホームページへ"
			className={`
                w-7 h-7
				flex items-center justify-center
				rounded-full
				${isActive ? "bg-gray-300 dark:bg-gray-700" : "bg-transparent"}
				hover:opacity-80 transition
            `}
		>
			<FaHome size={15} />
		</Link>
	);
}
