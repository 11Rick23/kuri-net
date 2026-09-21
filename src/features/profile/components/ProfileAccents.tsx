"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import styles from "./ProfileAccents.module.css";

const shapes = [
	<circle key="circle" cx="16" cy="16" r="14" />,
	<ellipse key="ellipse" cx="16" cy="16" rx="14" ry="10" />,
	<rect key="square" x="2" y="2" width="28" height="28" />,
	<rect key="rectangle" x="2" y="7" width="28" height="18" />,
	<path key="equilateral" d="M16 2 30 26.248711 2 26.248711Z" />,
	<path key="isosceles" d="M16 2 27 30 5 30Z" />,
];
type Placement = {
	shape: number;
	x: number;
	y: number;
	size: number;
	rotation: number;
	color: "peach" | "blue" | "green" | "purple" | "yellow" | "rose";
};
const placements: Placement[] = [
	{
		shape: 0,
		x: -24,
		y: -180,
		size: 1040,
		rotation: -12,
		color: "peach",
	},
	{
		shape: 4,
		x: 55,
		y: 40,
		size: 900,
		rotation: -18,
		color: "purple",
	},
	{
		shape: 2,
		x: 71,
		y: 700,
		size: 1000,
		rotation: 17,
		color: "green",
	},
	{
		shape: 1,
		x: -18,
		y: 1250,
		size: 880,
		rotation: 18,
		color: "yellow",
	},
	{
		shape: 5,
		x: 43,
		y: 1850,
		size: 960,
		rotation: -42,
		color: "blue",
	},
	{
		shape: 3,
		x: -27,
		y: 2500,
		size: 920,
		rotation: 9,
		color: "rose",
	},
	{ shape: 1, x: 64, y: 3150, size: 1040, rotation: -26, color: "green" },
	{ shape: 2, x: -20, y: 3800, size: 900, rotation: 22, color: "purple" },
	{ shape: 4, x: 47, y: 4500, size: 980, rotation: 15, color: "peach" },
	{ shape: 0, x: -31, y: 5200, size: 920, rotation: 0, color: "blue" },
	{ shape: 3, x: 62, y: 5900, size: 1000, rotation: -18, color: "yellow" },
	{ shape: 5, x: 4, y: 6600, size: 960, rotation: 32, color: "rose" },
];

export default function ProfileAccents() {
	const layer = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const element = layer.current;
		const page = element?.parentElement;
		if (!element || !page) return;
		let frame = 0;
		const follow = (event: PointerEvent) => {
			if (event.pointerType !== "mouse") return;
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const x = Math.max(
					-1,
					Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2),
				);
				const y = Math.max(
					-1,
					Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2),
				);
				element.style.setProperty("--pointer-x", `${x * 8}px`);
				element.style.setProperty("--pointer-y", `${y * 6}px`);
			});
		};
		const reset = () => {
			cancelAnimationFrame(frame);
			element.style.setProperty("--pointer-x", "0px");
			element.style.setProperty("--pointer-y", "0px");
		};
		page.addEventListener("pointermove", follow);
		page.addEventListener("pointerleave", reset);
		return () => {
			cancelAnimationFrame(frame);
			page.removeEventListener("pointermove", follow);
			page.removeEventListener("pointerleave", reset);
		};
	}, []);

	return (
		<div ref={layer} className={styles.accents} aria-hidden="true">
			{placements.map((placement, index) => {
				const style: CSSProperties & {
					"--size": string;
					"--depth": number;
				} = {
					left: `${placement.x}%`,
					top: `${placement.y}px`,
					rotate: `${placement.rotation}deg`,
					"--size": `${placement.size}px`,
					"--depth": index % 2 === 0 ? 1 : -0.7,
				};
				return (
					<svg
						aria-hidden="true"
						key={`${placement.shape}-${placement.x}-${placement.y}`}
						viewBox="0 0 32 32"
						className={styles.shape}
						style={style}
						data-color={placement.color}
					>
						{shapes[placement.shape]}
					</svg>
				);
			})}
		</div>
	);
}
