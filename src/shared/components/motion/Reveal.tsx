"use client";

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./Reveal.module.css";

export default function Reveal({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = ref.current;
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (
			!element ||
			reducedMotion.matches ||
			!("IntersectionObserver" in window)
		) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					element.dataset.reveal = "visible";
					observer.disconnect();
				}
			},
			{ threshold: 0.08 },
		);

		// SSRやスクリプト失敗時は隠さず、画面外の要素だけ出現を準備する。
		if (element.getBoundingClientRect().top >= window.innerHeight) {
			element.dataset.reveal = "pending";
			observer.observe(element);
		}

		const show = () => {
			if (reducedMotion.matches) {
				delete element.dataset.reveal;
				observer.disconnect();
			}
		};
		reducedMotion.addEventListener("change", show);
		return () => {
			observer.disconnect();
			reducedMotion.removeEventListener("change", show);
			delete element.dataset.reveal;
		};
	}, []);

	return (
		<div ref={ref} className={`${styles.reveal} ${className}`}>
			{children}
		</div>
	);
}
