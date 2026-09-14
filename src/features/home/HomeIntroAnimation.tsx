"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import LogoMark from "@/shared/components/brand/LogoMark";
import styles from "./HomeIntroAnimation.module.css";

const STEM_DURATION = 700;
const ARMS_DURATION = 1300;
const HOLD_DURATION = 180;
const MOVE_DURATION = 900;
const FADE_DURATION = 650;
const MOVE_START = STEM_DURATION + ARMS_DURATION + HOLD_DURATION;
const FADE_START = MOVE_START + MOVE_DURATION;

export default function HomeIntroAnimation({
	contentRef,
}: {
	contentRef: RefObject<HTMLDivElement | null>;
}) {
	const overlayRef = useRef<HTMLDivElement>(null);
	const backdropRef = useRef<HTMLDivElement>(null);
	const logoRef = useRef<HTMLDivElement>(null);
	const [complete, setComplete] = useState(false);

	useEffect(() => {
		const overlay = overlayRef.current;
		const backdrop = backdropRef.current;
		const logo = logoRef.current;
		const content = contentRef.current;
		const target = document.getElementById("site-logo");
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (
			!overlay ||
			!backdrop ||
			!logo ||
			!content ||
			!target ||
			reducedMotion.matches ||
			!("animate" in logo)
		) {
			setComplete(true);
			return;
		}

		const animations: Animation[] = [];
		const wasInert = content.inert;
		const previousVisibility = target.style.visibility;
		let released = false;
		let timeout: number | undefined;
		const release = () => {
			if (released) return;
			released = true;
			content.inert = wasInert;
			target.style.visibility = previousVisibility;
			window.clearTimeout(timeout);
			for (const animation of animations) animation.cancel();
			window.removeEventListener("keydown", skipOnKey, true);
			window.removeEventListener("resize", finish);
			document.removeEventListener("visibilitychange", skipWhenHidden);
			reducedMotion.removeEventListener("change", skipReducedMotion);
			overlay.removeEventListener("wheel", preventScroll);
		};
		const finish = () => {
			if (released) return;
			overlay.style.display = "none";
			release();
			setComplete(true);
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
		const preventScroll = (event: WheelEvent) => event.preventDefault();

		content.inert = true;
		// フェード中に同じ輪郭が重なり、線が濃くなるのを防ぐ。
		target.style.visibility = "hidden";
		window.addEventListener("keydown", skipOnKey, true);
		window.addEventListener("resize", finish);
		document.addEventListener("visibilitychange", skipWhenHidden);
		reducedMotion.addEventListener("change", skipReducedMotion);
		overlay.addEventListener("wheel", preventScroll, { passive: false });
		timeout = window.setTimeout(finish, FADE_START + FADE_DURATION + 1000);

		try {
			const origin = logo.getBoundingClientRect();
			const destination = target.getBoundingClientRect();
			const destinationStyle = getComputedStyle(target);

			for (const [index, path] of logo.querySelectorAll("path").entries()) {
				const initialStyle = getComputedStyle(path);
				animations.push(
					path.animate(
						[
							{ strokeDashoffset: 1, strokeDasharray: "1", offset: 0 },
							{ strokeDashoffset: 0, strokeDasharray: "1", offset: 0.999 },
							// 閉じた輪郭の始点に切れ目を残さないよう、完成時は実線に戻す。
							{ strokeDashoffset: 0, strokeDasharray: "none", offset: 1 },
						],
						{
							duration: index === 0 ? STEM_DURATION : ARMS_DURATION,
							delay: index === 0 ? 0 : STEM_DURATION,
							easing: "cubic-bezier(0.42, 0, 0.58, 1)",
							fill: "both",
						},
					),
					path.animate(
						[
							{
								fill: destinationStyle.fill,
								fillOpacity: 0,
								stroke: initialStyle.stroke,
								strokeWidth: initialStyle.strokeWidth,
							},
							{
								fill: destinationStyle.fill,
								fillOpacity: 1,
								stroke: destinationStyle.stroke,
								strokeWidth: destinationStyle.strokeWidth,
							},
						],
						{
							duration: MOVE_DURATION,
							delay: MOVE_START,
							easing: "ease-in-out",
							fill: "both",
						},
					),
				);
			}
			animations.push(
				logo.animate(
					[
						{
							left: `${origin.x}px`,
							top: `${origin.y}px`,
							width: `${origin.width}px`,
							height: `${origin.height}px`,
							transform: "none",
						},
						{
							// scale による描画差を残さず、ヘッダーと同じ実寸に着地する。
							left: `${destination.x}px`,
							top: `${destination.y}px`,
							width: `${destination.width}px`,
							height: `${destination.height}px`,
							transform: "none",
						},
					],
					{
						duration: MOVE_DURATION,
						delay: MOVE_START,
						easing: "cubic-bezier(0.65, 0, 0.25, 1)",
						fill: "both",
					},
				),
			);
			const fade = backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
				duration: FADE_DURATION,
				delay: FADE_START,
				easing: "ease-in-out",
				fill: "both",
			});
			animations.push(fade);
			fade.onfinish = finish;
		} catch {
			// 演出が使えない環境でも、本文の操作は必ず復帰させる。
			finish();
		}

		return release;
	}, [contentRef]);

	if (complete) return null;

	return (
		<>
			<div
				id="home-intro"
				ref={overlayRef}
				className={styles.overlay}
				aria-hidden="true"
			>
				<div ref={backdropRef} className={styles.backdrop} />
				<div ref={logoRef} className={styles.logo}>
					<LogoMark />
				</div>
			</div>
			<noscript>
				<style>{"#home-intro { display: none; }"}</style>
			</noscript>
		</>
	);
}
