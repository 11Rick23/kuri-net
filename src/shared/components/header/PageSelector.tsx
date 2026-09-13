"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MdArrowForward } from "react-icons/md";
import { lockBodyScroll } from "@/shared/components/modal/dialogAccessibility";
import styles from "./Header.module.css";
import PageButton from "./PageButton";

const duration = 800;

export default function PageSelector() {
	const panelId = useId();
	const panelRef = useRef<HTMLDivElement>(null);
	const surfaceRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const actions = useRef({ toggle: () => {}, close: () => {} });
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const panel = panelRef.current;
		const button = buttonRef.current;
		const surface = surfaceRef.current;
		if (!panel || !button || !surface) return;
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		let expanded = false;
		let animations: Animation[] = [];
		let releaseBackground: (() => void) | undefined;

		const finishClose = () => {
			if (panel.matches(":popover-open")) panel.hidePopover();
			for (const animation of animations) animation.cancel();
			animations = [];
			releaseBackground?.();
			releaseBackground = undefined;
		};
		const prepare = () => {
			panel.showPopover();
			panel.scrollTop = 0;
			const origin = button.getBoundingClientRect();
			const bounds = panel.getBoundingClientRect();
			const originX = origin.left + origin.width / 2;
			const originY = origin.top + origin.height / 2 - bounds.top;
			const radius = Math.min(360, bounds.width - 32, bounds.height - 24) / 2;
			const x = Math.max(
				radius + 16,
				Math.min(originX, bounds.width - radius - 16),
			);
			const y = radius + 12;
			panel.style.setProperty("--menu-x", `${x}px`);
			panel.style.setProperty("--menu-y", `${y}px`);
			const collapsed = `circle(0px at ${originX}px ${originY}px)`;
			const circle = `circle(${radius}px at ${x}px ${y}px)`;
			const easing = getComputedStyle(panel)
				.getPropertyValue("--site-ease")
				.trim();
			animations = [
				surface.animate(
					[
						{ clipPath: collapsed, offset: 0, easing },
						{ clipPath: circle, offset: 0.7 },
						{ clipPath: circle, offset: 1 },
					],
					{ duration, fill: "both" },
				),
				...Array.from(panel.querySelectorAll("a"), (link, index) => {
					const start = 0.25 + index * 0.1;
					return link.animate(
						[
							{ opacity: 0, transform: "translateY(20px)", offset: 0 },
							{
								opacity: 0,
								transform: "translateY(20px)",
								offset: start,
								easing,
							},
							{ opacity: 1, transform: "translateY(0)", offset: start + 0.55 },
							{ opacity: 1, transform: "translateY(0)", offset: 1 },
						],
						{ duration, fill: "both" },
					);
				}),
			];
			const content = document.getElementById("main-content");
			if (content) {
				animations.push(
					content.animate(
						[
							{ filter: "blur(0px)", offset: 0, easing },
							{ filter: "blur(3px)", offset: 0.7 },
							{ filter: "blur(3px)", offset: 1 },
						],
						{ duration, fill: "both" },
					),
				);
			}
			const arrow = button.querySelector("svg");
			if (arrow) {
				animations.push(
					arrow.animate(
						[
							{ transform: "rotate(0deg)", offset: 0, easing },
							{ transform: "rotate(90deg)", offset: 0.5 },
							{ transform: "rotate(90deg)", offset: 1 },
						],
						{ duration, fill: "both" },
					),
				);
			}
			for (const animation of animations) {
				animation.pause();
				animation.currentTime = 0;
			}
			animations[0].onfinish = () => {
				if (!expanded) finishClose();
			};
			const wasInert = content?.inert ?? false;
			const unlockScroll = lockBodyScroll(document.body.style);
			if (content) content.inert = true;
			releaseBackground = () => {
				if (content) content.inert = wasInert;
				unlockScroll();
			};
		};
		const change = (open: boolean, immediate = false) => {
			if (open === expanded && !immediate) return;
			expanded = open;
			setIsOpen(open);
			if (open && !animations.length) prepare();
			if (!open && panel.contains(document.activeElement)) button.focus();
			panel.inert = !open;
			if (immediate || reducedMotion.matches) {
				if (!open) finishClose();
				else {
					for (const animation of animations) {
						animation.pause();
						animation.currentTime = duration;
					}
				}
				return;
			}
			// 同じタイムラインを逆再生し、連打時も途中の位置から折り返す。
			for (const animation of animations) {
				animation.updatePlaybackRate(open ? 1 : -1);
				animation.play();
			}
		};
		const close = () => change(false);
		const closeOnResize = () => change(false, true);
		const onKeyDown = (event: KeyboardEvent) => {
			if (expanded && event.key === "Escape") {
				event.preventDefault();
				close();
			}
		};
		const onPointerDown = (event: PointerEvent) => {
			if (
				event.target instanceof Node &&
				!panel.contains(event.target) &&
				!button.contains(event.target)
			)
				close();
		};
		const onMotionChange = () => change(expanded, true);
		actions.current = { toggle: () => change(!expanded), close };
		window.addEventListener("resize", closeOnResize);
		window.addEventListener("popstate", close);
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("pointerdown", onPointerDown);
		reducedMotion.addEventListener("change", onMotionChange);
		return () => {
			window.removeEventListener("resize", closeOnResize);
			window.removeEventListener("popstate", close);
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("pointerdown", onPointerDown);
			reducedMotion.removeEventListener("change", onMotionChange);
			finishClose();
			actions.current = { toggle: () => {}, close: () => {} };
		};
	}, []);

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className={styles.pageSelector}
				aria-controls={panelId}
				aria-expanded={isOpen}
				onClick={() => actions.current.toggle()}
				aria-label="Page：ページを選択"
			>
				Page
				<MdArrowForward className={styles.selectorMark} aria-hidden="true" />
			</button>
			<div
				id={panelId}
				ref={panelRef}
				className={styles.pagePanel}
				popover="manual"
			>
				<button
					type="button"
					className={styles.pageBackdrop}
					aria-label="メニューを閉じる"
					tabIndex={-1}
					onClick={() => actions.current.close()}
				/>
				<div ref={surfaceRef} className={styles.pageSurface}>
					<div className={styles.pageOptions}>
						<PageButton
							url="/profile"
							display="Profile"
							onClick={() => actions.current.close()}
						/>
						<PageButton
							url="/works"
							display="Works"
							onClick={() => actions.current.close()}
						/>
						<PageButton
							url="/apps"
							display="Apps"
							match="prefix"
							onClick={() => actions.current.close()}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
