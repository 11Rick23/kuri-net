"use client";

import { type ReactNode, useEffect, useRef } from "react";
import LogoMark from "@/shared/components/brand/LogoMark";
import { createCardCorners } from "../lib/cardGeometry";
import { createCardMotion } from "../lib/cardMotion";
import styles from "./ProfileBusinessCard.module.css";

const cornerSegments = createCardCorners();

export default function TiltableCard({ children }: { children: ReactNode }) {
	const cardRef = useRef<HTMLDivElement>(null);

	const areaRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const area = areaRef.current;
		const card = cardRef.current;
		if (!area || !card) return;
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const hover = window.matchMedia("(any-hover: hover)");
		const motion = createCardMotion();
		let frame = 0;
		let lastFrame = 0;

		function paint() {
			if (!card) return;
			const { x, y } = motion.angle;
			const lightX = Math.sin((x * Math.PI) / 180);
			const lightY = Math.sin((y * Math.PI) / 180);
			card.style.setProperty("--card-tilt-x", `${x}deg`);
			card.style.setProperty("--card-tilt-y", `${y}deg`);
			card.style.setProperty("--card-glare-x", `${50 + lightY * 18}%`);
			card.style.setProperty("--card-glare-y", `${50 - lightX * 18}%`);
			card.style.setProperty(
				"--card-light-angle",
				`${(lightY - lightX) * 12}deg`,
			);
		}

		function animate(time: number) {
			const moving = motion.advance(Math.min(time - lastFrame, 64));
			lastFrame = time;
			paint();
			frame = moving ? requestAnimationFrame(animate) : 0;
		}

		function schedule() {
			if (frame) return;
			lastFrame = performance.now();
			frame = requestAnimationFrame(animate);
		}

		function reset() {
			if (!area || !card) return;
			const pointerId = motion.pointerId;
			motion.reset(reducedMotion.matches || document.hidden);
			delete card.dataset.dragging;
			if (pointerId !== undefined && area.hasPointerCapture(pointerId))
				area.releasePointerCapture(pointerId);
			schedule();
		}

		function start(event: PointerEvent) {
			if (
				!area ||
				!card ||
				!event.isPrimary ||
				event.button !== 0 ||
				reducedMotion.matches
			)
				return;
			if (event.target instanceof Element && event.target.closest("a, button"))
				return;
			const bounds = area.getBoundingClientRect();
			if (
				!motion.start(
					event.pointerId,
					event.clientX,
					event.clientY,
					bounds.width,
					bounds.height,
					event.timeStamp,
				)
			)
				return;
			area.setPointerCapture(event.pointerId);
			card.dataset.dragging = "true";
			schedule();
		}

		function move(event: PointerEvent) {
			if (!area || reducedMotion.matches) return;
			if (motion.pointerId !== undefined) {
				motion.move(
					event.pointerId,
					event.clientX,
					event.clientY,
					event.timeStamp,
				);
			} else {
				if (
					event.pointerType !== "mouse" ||
					event.buttons !== 0 ||
					!hover.matches
				)
					return;
				const bounds = area.getBoundingClientRect();
				motion.hover(
					Math.max(
						-5,
						Math.min(
							5,
							(0.5 - (event.clientY - bounds.top) / bounds.height) * 10,
						),
					),
					Math.max(
						-5,
						Math.min(
							5,
							((event.clientX - bounds.left) / bounds.width - 0.5) * 10,
						),
					),
				);
			}
			schedule();
		}

		function leave() {
			if (motion.pointerId === undefined && !motion.settling) reset();
		}

		function end(event: PointerEvent) {
			if (event.pointerId !== motion.pointerId) return;
			if (event.type !== "pointerup" || reducedMotion.matches) {
				reset();
				return;
			}
			motion.release(event.timeStamp);
			if (card) delete card.dataset.dragging;
			if (area?.hasPointerCapture(event.pointerId))
				area.releasePointerCapture(event.pointerId);
			schedule();
		}

		area.addEventListener("pointerenter", move);
		area.addEventListener("pointerleave", leave);
		area.addEventListener("pointerdown", start);
		area.addEventListener("pointermove", move);
		area.addEventListener("pointerup", end);
		area.addEventListener("pointercancel", end);
		area.addEventListener("lostpointercapture", end);
		window.addEventListener("blur", reset);
		window.addEventListener("resize", reset);
		document.addEventListener("visibilitychange", reset);
		reducedMotion.addEventListener("change", reset);
		return () => {
			reset();
			cancelAnimationFrame(frame);
			area.removeEventListener("pointerenter", move);
			area.removeEventListener("pointerleave", leave);
			area.removeEventListener("pointerdown", start);
			area.removeEventListener("pointermove", move);
			area.removeEventListener("pointerup", end);
			area.removeEventListener("pointercancel", end);
			area.removeEventListener("lostpointercapture", end);
			window.removeEventListener("blur", reset);
			window.removeEventListener("resize", reset);
			document.removeEventListener("visibilitychange", reset);
			reducedMotion.removeEventListener("change", reset);
		};
	}, []);

	return (
		<div className={styles.stage}>
			<div ref={areaRef} className={styles.interaction}>
				<div ref={cardRef} className={styles.card}>
					<div className={styles.back} aria-hidden="true">
						<LogoMark className={styles.backLogo} />
					</div>
					<span
						aria-hidden="true"
						className={`${styles.edge} ${styles.edgeTop}`}
					/>
					<span
						aria-hidden="true"
						className={`${styles.edge} ${styles.edgeBottom}`}
					/>
					<span
						aria-hidden="true"
						className={`${styles.edge} ${styles.edgeLeft}`}
					/>
					<span
						aria-hidden="true"
						className={`${styles.edge} ${styles.edgeRight}`}
					/>
					{cornerSegments.map(({ id, ...style }) => (
						<span
							key={id}
							aria-hidden="true"
							className={`${styles.edge} ${styles.edgeCorner}`}
							style={style}
						/>
					))}
					<div className={styles.surface}>{children}</div>
				</div>
			</div>
		</div>
	);
}
