"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function PageButton({
	url,
	display,
	match = "exact",
	onClick,
}: {
	url: string;
	display: string;
	match?: "exact" | "prefix";
	onClick?: () => void;
}) {
	const pathname = usePathname();
	const isActive =
		match === "prefix"
			? pathname === url || pathname.startsWith(`${url}/`)
			: pathname === url;

	return (
		<Link
			href={url}
			onClick={onClick}
			aria-label={`${display}ページへ`}
			aria-current={isActive ? "page" : undefined}
			className={styles.pageLink}
		>
			{display}
		</Link>
	);
}
