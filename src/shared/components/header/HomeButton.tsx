"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function HomeButton() {
	const pathname = usePathname();
	const isActive = pathname === "/";

	return (
		<Link
			href="/"
			aria-label="ホームページへ"
			aria-current={isActive ? "page" : undefined}
			className={styles.brand}
		>
			<span className={styles.brandMark} aria-hidden="true" />
		</Link>
	);
}
