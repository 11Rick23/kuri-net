"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import styles from "./ProfileAccents.module.css";

const shapes = [
	<circle key="circle" cx="16" cy="16" r="14" />,
	<path key="equilateral" d="M16 2 30 26.248711 2 26.248711Z" />,
	<rect key="square" x="2" y="2" width="28" height="28" />,
	<path key="isosceles-tall" d="M16 2 23 30 9 30Z" />,
	<rect key="rectangle-wide" x="2" y="9" width="28" height="14" />,
	<path key="isosceles-wide" d="M16 7 30 25 2 25Z" />,
	<rect key="rectangle-tall" x="9" y="2" width="14" height="28" />,
	<path key="isosceles-medium" d="M16 2 27 30 5 30Z" />,
	<rect key="rectangle-slim" x="2" y="12" width="28" height="8" />,
	<path key="isosceles-flat" d="M16 11 30 21 2 21Z" />,
	<rect key="rectangle-upright" x="6" y="2" width="20" height="28" />,
	<path
		key="pentagon"
		d="M16 2 29.31479 11.67376 24.22899 27.32624 7.77101 27.32624 2.68521 11.67376Z"
	/>,
];

const lanes = [
	[760, 240, 460, 700, 340, 580],
	[280, 820, 400, 520, 880, 220],
	[360, 640, 480, 300, 800, 560],
	[680, 260, 420, 740, 320, 620],
].map((sizes, lane) => ({
	id: lane,
	duration: (110 + lane * 19) * 2,
	delay: -(110 + lane * 19) * 2 * (0.12 + lane * 0.21),
	placements: sizes.map((size, index) => ({
		id: lane * 6 + index,
		shape: (lane * 6 + index) % shapes.length,
		size,
		x: (index * 100) / sizes.length,
		y: [0, 38, 16, 30, 8, 42][index],
		rotation: ((index * 37 + lane * 23) % 180) - 90,
		contrast: 0.32 + ((index * 3 + lane) % 7) * 0.1,
		outline: size >= 620,
		floatDuration: 28 + ((index * 7 + lane * 11) % 31),
		floatDistance: (16 + ((index + lane) % 4) * 8) * (index % 2 ? -1 : 1),
		scaleFrom: 0.86 + (index % 3) * 0.03,
		scaleTo: 1.05 + (lane % 3) * 0.03,
	})),
}));

type AccentStyle = CSSProperties & {
	[key: `--${string}`]: string | number;
};

export default function ProfileAccents() {
	const layer = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const element = layer.current;
		const page = element?.parentElement;
		if (!element || !page) return;
		const travelers = element.querySelectorAll<HTMLDivElement>(
			`.${styles.traveler}`,
		);
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		let frame = 0;
		const repel = (event: PointerEvent) => {
			if (event.pointerType !== "mouse" || reducedMotion.matches) return;
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const offsets = new Map<
					string,
					{ x: number; y: number; strength: number }
				>();
				for (const traveler of travelers) {
					const id = traveler.dataset.shape;
					if (!id) continue;
					const bounds = traveler.getBoundingClientRect();
					const dx = bounds.x + bounds.width / 2 - event.clientX;
					const dy = bounds.y + bounds.height / 2 - event.clientY;
					const distance = Math.hypot(dx, dy);
					const radius = bounds.width / 2 + 120;
					const strength = Math.max(0, 1 - distance / radius) * 24;
					if (strength <= (offsets.get(id)?.strength ?? -1)) continue;
					offsets.set(id, {
						x: distance ? (dx / distance) * strength : strength,
						y: distance ? (dy / distance) * strength : 0,
						strength,
					});
				}
				// 同じ図形の複製にも変位を共有し、ループ境界で位置が跳ばないようにする。
				for (const [id, offset] of offsets) {
					element.style.setProperty(`--repel-x-${id}`, `${offset.x}px`);
					element.style.setProperty(`--repel-y-${id}`, `${offset.y}px`);
				}
			});
		};
		const reset = () => {
			cancelAnimationFrame(frame);
			for (const lane of lanes) {
				for (const placement of lane.placements) {
					element.style.removeProperty(`--repel-x-${placement.id}`);
					element.style.removeProperty(`--repel-y-${placement.id}`);
				}
			}
		};
		page.addEventListener("pointermove", repel);
		page.addEventListener("pointerleave", reset);
		page.addEventListener("pointercancel", reset);
		window.addEventListener("blur", reset);
		reducedMotion.addEventListener("change", reset);
		return () => {
			reset();
			page.removeEventListener("pointermove", repel);
			page.removeEventListener("pointerleave", reset);
			page.removeEventListener("pointercancel", reset);
			window.removeEventListener("blur", reset);
			reducedMotion.removeEventListener("change", reset);
		};
	}, []);

	return (
		<div ref={layer} className={styles.accents} aria-hidden="true">
			{lanes.map((lane) => (
				<div
					key={lane.id}
					className={styles.lane}
					style={
						{
							top: `${lane.id * 25 - 3}%`,
							"--drift-duration": `${lane.duration}s`,
							"--drift-delay": `${lane.delay}s`,
						} as AccentStyle
					}
				>
					<div className={styles.track}>
						{[-1, 0, 1].map((copy) => (
							<div
								key={copy}
								className={styles.tile}
								data-copy={copy}
								style={{ left: `${copy * 100}%` }}
							>
								{lane.placements.map((placement) => (
									<div
										key={placement.id}
										className={styles.traveler}
										data-shape={placement.id}
										style={
											{
												left: `${placement.x}%`,
												top: `${placement.y}%`,
												"--size": `${placement.size}px`,
												"--repel-x": `var(--repel-x-${placement.id}, 0px)`,
												"--repel-y": `var(--repel-y-${placement.id}, 0px)`,
												"--float-duration": `${placement.floatDuration}s`,
												"--float-distance": `${placement.floatDistance}px`,
												"--scale-from": placement.scaleFrom,
												"--scale-to": placement.scaleTo,
												"--rotation": `${placement.rotation}deg`,
												"--fill-opacity": placement.outline
													? 0
													: placement.contrast,
											} as AccentStyle
										}
									>
										<svg
											aria-hidden="true"
											viewBox="0 0 32 32"
											className={styles.shape}
										>
											{shapes[placement.shape]}
										</svg>
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
