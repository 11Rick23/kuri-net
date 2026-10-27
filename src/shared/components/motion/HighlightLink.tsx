"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, type ReactNode, useRef } from "react";
import { useHighlightAction } from "./ClickHighlight";

export default function HighlightLink({
	href,
	className,
	children,
	target,
	...props
}: {
	href: string;
	className?: string;
	children: ReactNode;
} & Pick<
	ComponentProps<"a">,
	"aria-label" | "title" | "target" | "rel" | "draggable"
>) {
	const router = useRouter();
	const linkRef = useRef<HTMLAnchorElement>(null);
	const runAfterHighlight = useHighlightAction();

	return (
		<Link
			{...props}
			ref={linkRef}
			href={href}
			className={className}
			target={target}
			data-click-highlight
			onClick={(event) => {
				if (
					target !== "_blank" ||
					event.defaultPrevented ||
					event.button !== 0 ||
					event.metaKey ||
					event.ctrlKey ||
					event.shiftKey ||
					event.altKey
				) {
					return;
				}
				event.preventDefault();
				runAfterHighlight(event.currentTarget, () => {
					window.open(href, "_blank", "noopener,noreferrer");
				});
			}}
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
