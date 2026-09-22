"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useLayoutEffect,
	useRef,
} from "react";
import styles from "./ProfileStory.module.css";

export const ProfileSpaceContext = createContext<() => Promise<void>>(
	async () => {},
);

export default function ProfileParagraph({
	children,
}: {
	children: ReactNode;
}) {
	const container = useRef<HTMLDivElement>(null);
	const content = useRef<HTMLParagraphElement>(null);
	const animation = useRef<Animation | null>(null);
	const targetHeight = useRef<number | null>(null);

	const resize = useCallback(() => {
		const outer = container.current;
		const inner = content.current;
		if (!outer || !inner) return;
		const next = inner.getBoundingClientRect().height;
		if (targetHeight.current === next) return;
		const previous = outer.getBoundingClientRect().height;
		const initialized = targetHeight.current !== null;
		animation.current?.cancel();
		animation.current = null;
		targetHeight.current = next;
		outer.style.height = `${next}px`;
		if (
			!initialized ||
			previous === next ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		)
			return;
		const running = outer.animate(
			[{ height: `${previous}px` }, { height: `${next}px` }],
			{ duration: 360, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
		);
		animation.current = running;
		running.onfinish = () => {
			if (animation.current === running) animation.current = null;
		};
	}, []);

	const waitForSpace = useCallback(async () => {
		resize();
		while (animation.current) {
			const running = animation.current;
			try {
				await running.finished;
			} catch {
				// 連続操作で高さの目標が変わった場合は、次のアニメーションを待つ。
			}
			if (animation.current === running) animation.current = null;
		}
	}, [resize]);

	useLayoutEffect(() => {
		resize();
		const observer = new ResizeObserver(resize);
		if (content.current) observer.observe(content.current);
		const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
		const onPreferenceChange = () => {
			if (preference.matches) {
				animation.current?.cancel();
				animation.current = null;
			}
		};
		preference.addEventListener("change", onPreferenceChange);
		return () => {
			observer.disconnect();
			animation.current?.cancel();
			animation.current = null;
			preference.removeEventListener("change", onPreferenceChange);
		};
	}, [resize]);

	return (
		<ProfileSpaceContext.Provider value={waitForSpace}>
			<div ref={container} className={styles.paragraph}>
				<p ref={content}>{children}</p>
			</div>
		</ProfileSpaceContext.Provider>
	);
}
