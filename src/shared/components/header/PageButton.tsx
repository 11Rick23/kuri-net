"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PageButton({
	url,
	display,
	match = "exact",
}: {
	url: string;
	display: string;
	match?: "exact" | "prefix";
}) {
	const pathname = usePathname();
	const isActive =
		match === "prefix"
			? pathname === url || pathname.startsWith(`${url}/`)
			: pathname === url;

	return (
		<Link
			href={url}
			aria-label={`${display}ページへ`}
			aria-current={isActive ? "page" : undefined}
			className={`
                flex items-center justify-center
                rounded-md px-2 py-1 cursor-pointer
                ${isActive ? "bg-ctp-surface0" : "bg-transparent"}
                text-xs font-bold text-ctp-text
                hover:bg-ctp-surface0
            `}
		>
			{display}
		</Link>
	);
}
