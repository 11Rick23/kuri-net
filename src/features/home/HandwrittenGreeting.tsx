"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./HandwrittenGreeting.module.css";

// Zen Kaku Gothic New の字形を、筆順に沿って見せるマスクの中心線。
const strokes = [
	"M 29 43 Q 50 47 70 43",
	"M 22 89 C 27 109 53 103 80 99",
	"M 154 33 L 115 108 C 130 76 141 68 151 74 C 166 82 148 108 167 106 C 179 106 187 95 191 86",
	"M 229 38 Q 222 74 227 109",
	"M 249 50 Q 270 52 289 49",
	"M 250 85 C 242 103 264 105 293 98",
	"M 323 50 Q 352 54 392 45",
	"M 355 29 C 356 51 347 75 338 89 C 356 72 390 70 388 91 C 387 108 366 113 349 110",
	"M 433 37 Q 428 76 432 109",
	"M 452 54 Q 478 57 502 50",
	"M 478 33 L 480 91 C 485 115 450 110 453 96 C 456 81 484 88 504 103",
];

export default function HandwrittenGreeting() {
	const svgRef = useRef<SVGSVGElement>(null);
	const maskId = useId();

	useEffect(() => {
		const svg = svgRef.current;
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (!svg || reducedMotion.matches || !("animate" in svg)) return;

		const animations: Animation[] = [];
		let observer: MutationObserver | undefined;
		let timeout: number | undefined;
		let started = false;
		let finished = false;
		const finish = () => {
			finished = true;
			delete svg.dataset.writing;
			observer?.disconnect();
			window.clearTimeout(timeout);
			for (const animation of animations) animation.cancel();
		};
		const start = () => {
			if (started || finished) return;
			started = true;
			observer?.disconnect();
			window.clearTimeout(timeout);
			for (const animation of animations) animation.play();
		};
		const skipOnKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" || event.key === "Tab") finish();
		};
		const skipWhenHidden = () => {
			if (document.hidden) finish();
		};
		const skipReducedMotion = () => {
			if (reducedMotion.matches) finish();
		};

		try {
			svg.dataset.writing = "true";
			const paths = [...svg.querySelectorAll("path")];
			const lengths = paths.map((path) => path.getTotalLength());
			const totalLength = lengths.reduce((sum, length) => sum + length, 0);
			let delay = 100;
			for (const [index, path] of paths.entries()) {
				const duration = (lengths[index] / totalLength) * 2500;
				const animation = path.animate(
					[
						{ strokeDashoffset: 1, opacity: 0, offset: 0 },
						{ strokeDashoffset: 0.99, opacity: 1, offset: 0.01 },
						{ strokeDashoffset: 0, opacity: 1, offset: 1 },
					],
					{
						duration,
						delay,
						easing: "cubic-bezier(0.4, 0, 0.3, 1)",
						fill: "both",
					},
				);
				animation.pause();
				animations.push(animation);
				delay += duration + 35;
			}
			animations[animations.length - 1].onfinish = finish;

			// ロゴ演出のDOMが外れるまで待ち、背景の裏で書き終わるのを防ぐ。
			const intro = document.getElementById("home-intro");
			if (intro?.parentElement && getComputedStyle(intro).display !== "none") {
				observer = new MutationObserver(() => {
					if (!intro.isConnected) start();
				});
				observer.observe(intro.parentElement, { childList: true });
				// ロゴ側のCSSフォールバック（8秒）後も、文字を隠したままにしない。
				timeout = window.setTimeout(start, 8200);
			} else {
				start();
			}
		} catch {
			finish();
		}

		window.addEventListener("keydown", skipOnKey);
		document.addEventListener("visibilitychange", skipWhenHidden);
		reducedMotion.addEventListener("change", skipReducedMotion);
		return () => {
			finish();
			window.removeEventListener("keydown", skipOnKey);
			document.removeEventListener("visibilitychange", skipWhenHidden);
			reducedMotion.removeEventListener("change", skipReducedMotion);
		};
	}, []);

	return (
		<>
			<span className="sr-only">こんにちは。</span>
			<svg
				ref={svgRef}
				className={styles.handwriting}
				viewBox="0 0 621 145"
				aria-hidden="true"
				focusable="false"
			>
				<defs>
					<mask
						id={maskId}
						maskUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="621"
						height="145"
					>
						<rect
							className={styles.completeMask}
							width="621"
							height="145"
							fill="white"
						/>
						<g
							fill="none"
							stroke="white"
							strokeWidth="22"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							{strokes.map((stroke) => (
								<path
									key={stroke}
									d={stroke}
									pathLength="1"
									strokeDasharray="1"
								/>
							))}
						</g>
					</mask>
				</defs>
				<text
					className={styles.lettering}
					x="0"
					y="110"
					fill="currentColor"
					mask={`url(#${maskId})`}
				>
					こんにちは
				</text>
				{/* 句点は6時から時計回りに描き、本文の縦画に近い太さにそろえる。 */}
				<path
					d="M 538 114 A 10 10 0 0 1 538 94 A 10 10 0 0 1 538 114 Z"
					fill="none"
					stroke="currentColor"
					strokeWidth="9"
					strokeLinecap="round"
					pathLength="1"
					strokeDasharray="1"
				/>
			</svg>
		</>
	);
}
