"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PageButton({
	url,
	display,
}: {
	url: string;
	display: string;
}) {
	const pathname = usePathname();
	const isActive = pathname === url;

	return (
		<Link
			href={url}
			type="button"
			aria-label={`${display}ページへ`}
			className={`
				flex items-center justify-center
				rounded-full px-2 py-1
				${isActive ? "bg-gray-300 dark:bg-gray-700" : "bg-transparent"}
                text-xs font-bold
				hover:opacity-80 transition
            `}
		>
			{display}
		</Link>
	);
}
