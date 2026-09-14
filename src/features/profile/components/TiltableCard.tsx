"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { createCardCorners } from "../lib/cardGeometry";
import { dragAngle } from "../lib/cardMotion";
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
		let tilt = { x: 0, y: 0 };
		let drag: {
			id: number;
			x: number;
			y: number;
			width: number;
			height: number;
			tilt: { x: number; y: number };
		} | null = null;

		function reset() {
			if (!area || !card) return;
			const pointerId = drag?.id;
			drag = null;
			tilt = { x: 0, y: 0 };
			delete card.dataset.hovering;
			delete card.dataset.dragging;
			card.style.removeProperty("--card-tilt-x");
			card.style.removeProperty("--card-tilt-y");
			card.style.removeProperty("--card-glare-x");
			card.style.removeProperty("--card-glare-y");
			card.style.removeProperty("--card-light-angle");
			if (pointerId !== undefined && area.hasPointerCapture(pointerId)) {
				area.releasePointerCapture(pointerId);
			}
		}

		function start(event: PointerEvent) {
			if (
				!area ||
				!card ||
				drag ||
				!event.isPrimary ||
				event.button !== 0 ||
				reducedMotion.matches
			)
				return;
			if (event.target instanceof Element && event.target.closest("a, button"))
				return;
			const bounds = area.getBoundingClientRect();
			drag = {
				id: event.pointerId,
				x: event.clientX,
				y: event.clientY,
				width: bounds.width,
				height: bounds.height,
				tilt,
			};
			area.setPointerCapture(event.pointerId);
			delete card.dataset.hovering;
			card.dataset.dragging = "true";
		}

		function paint(x: number, y: number) {
			if (!card) return;
			tilt = { x, y };
			card.style.setProperty("--card-tilt-x", `${x}deg`);
			card.style.setProperty("--card-tilt-y", `${y}deg`);
			card.style.setProperty(
				"--card-glare-x",
				`${50 + Math.max(-18, Math.min(18, y * 0.4))}%`,
			);
			card.style.setProperty(
				"--card-glare-y",
				`${50 - Math.max(-18, Math.min(18, x * 0.4))}%`,
			);
			card.style.setProperty(
				"--card-light-angle",
				`${Math.max(-24, Math.min(24, (y - x) * 0.3))}deg`,
			);
		}

		function move(event: PointerEvent) {
			if (!card || !area || reducedMotion.matches) return;
			if (drag) {
				if (event.pointerId !== drag.id) return;
				paint(
					dragAngle(drag.y - event.clientY, drag.height, drag.tilt.x),
					dragAngle(event.clientX - drag.x, drag.width, drag.tilt.y),
				);
			} else if (event.pointerType === "mouse" && hover.matches) {
				const bounds = area.getBoundingClientRect();
				card.dataset.hovering = "true";
				paint(
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
		}

		function leave() {
			if (!drag) reset();
		}

		function end(event: PointerEvent) {
			if (event.pointerId === drag?.id) reset();
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
