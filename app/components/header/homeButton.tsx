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
				rounded-full cursor-pointer
				${isActive ? "bg-gray-300 dark:bg-gray-700" : "bg-transparent"}
				hover:bg-gray-300 dark:hover:bg-gray-700
            `}
		>
			<FaHome size={15} />
		</Link>
	);
}
