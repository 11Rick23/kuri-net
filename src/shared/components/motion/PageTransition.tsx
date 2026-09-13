"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, ViewTransition } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		let frame = 0;
		let animation: Animation | undefined;
		const cancel = () => {
			window.cancelAnimationFrame(frame);
			animation?.cancel();
		};
		const onPopState = () => {
			cancel();
			if (window.location.pathname === "/" || reducedMotion.matches) return;
			// 履歴の復元処理を待ち、次の描画前にフェードインを開始する。
			frame = window.requestAnimationFrame(() => {
				const content = contentRef.current;
				if (!content) return;
				const style = getComputedStyle(content);
				const duration = style.getPropertyValue("--site-duration-page").trim();
				animation = content.animate([{ opacity: 0 }, { opacity: 1 }], {
					// 本番CSSは ms を s に短縮するため、両方の単位を扱う。
					duration:
						Number.parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000),
					easing: style.getPropertyValue("--site-ease").trim(),
				});
			});
		};
		window.addEventListener("popstate", onPopState);
		reducedMotion.addEventListener("change", cancel);
		return () => {
			cancel();
			window.removeEventListener("popstate", onPopState);
			reducedMotion.removeEventListener("change", cancel);
		};
	}, []);

	return (
		<ViewTransition
			name="page-content"
			default="none"
			update={pathname === "/" ? "none" : "page-crossfade"}
		>
			<div id="main-content" ref={contentRef}>
				{children}
			</div>
		</ViewTransition>
	);
}
