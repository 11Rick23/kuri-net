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
			<svg
				className={styles.brandMark}
				viewBox="0 0 100 100"
				fill="none"
				aria-hidden="true"
				focusable="false"
			>
				{/* public/logo-outline.svg の形状を保ち、パスごとに描画する。 */}
				<path
					className={styles.brandStem}
					d="M18 18H34V82H18Z"
					pathLength="1"
				/>
				<path
					className={styles.brandArms}
					d="M42 43L66 18H86L55 50L86 82H65L42 57Z"
					pathLength="1"
					strokeLinejoin="round"
				/>
			</svg>
		</Link>
	);
}
