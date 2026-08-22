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
			aria-label="ホームページへ"
			aria-current={isActive ? "page" : undefined}
			className={`
                w-7 h-7
                flex items-center justify-center
                rounded-md cursor-pointer
                text-ctp-text
                ${isActive ? "bg-ctp-surface0" : "bg-transparent"}
                hover:bg-ctp-surface0
            `}
		>
			<FaHome size={15} />
		</Link>
	);
}
