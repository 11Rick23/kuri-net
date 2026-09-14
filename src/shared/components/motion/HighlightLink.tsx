"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useRef } from "react";
import { useHighlightAction } from "./ClickHighlight";

export default function HighlightLink({
	href,
	className,
	children,
}: {
	href: string;
	className?: string;
	children: ReactNode;
}) {
	const router = useRouter();
	const linkRef = useRef<HTMLAnchorElement>(null);
	const runAfterHighlight = useHighlightAction();

	return (
		<Link
			ref={linkRef}
			href={href}
			className={className}
			data-click-highlight
			onNavigate={(event) => {
				const link = linkRef.current;
				if (!link) return;
				event.preventDefault();
				runAfterHighlight(link, () => router.push(href));
			}}
		>
			{children}
		</Link>
	);
}
