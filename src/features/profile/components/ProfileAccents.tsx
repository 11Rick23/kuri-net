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
	edge: "left" | "right";
	bleed: number;
	y: number;
	size: number;
	rotation: number;
	color:
		| "peach"
		| "blue"
		| "green"
		| "purple"
		| "yellow"
		| "rose"
		| "mint"
		| "orange";
};
const placements: Placement[] = [
	{
		shape: 0,
		edge: "left",
		bleed: 0.36,
		y: -180,
		size: 1260,
		rotation: -12,
		color: "peach",
	},
	{
		shape: 4,
		edge: "right",
		bleed: 0.38,
		y: 40,
		size: 1160,
		rotation: -18,
		color: "purple",
	},
	{
		shape: 2,
		edge: "right",
		bleed: 0.42,
		y: 610,
		size: 1200,
		rotation: 17,
		color: "green",
	},
	{
		shape: 1,
		edge: "left",
		bleed: 0.36,
		y: 1130,
		size: 1180,
		rotation: 18,
		color: "yellow",
	},
	{
		shape: 5,
		edge: "right",
		bleed: 0.4,
		y: 1690,
		size: 1240,
		rotation: -42,
		color: "blue",
	},
	{
		shape: 3,
		edge: "left",
		bleed: 0.38,
		y: 2270,
		size: 1220,
		rotation: 9,
		color: "rose",
	},
	{
		shape: 1,
		edge: "right",
		bleed: 0.36,
		y: 2820,
		size: 1300,
		rotation: -26,
		color: "mint",
	},
	{
		shape: 2,
		edge: "left",
		bleed: 0.4,
		y: 3380,
		size: 1160,
		rotation: 22,
		color: "purple",
	},
	{
		shape: 4,
		edge: "right",
		bleed: 0.38,
		y: 3950,
		size: 1260,
		rotation: 15,
		color: "orange",
	},
	{
		shape: 0,
		edge: "left",
		bleed: 0.36,
		y: 4520,
		size: 1220,
		rotation: 0,
		color: "blue",
	},
	{
		shape: 3,
		edge: "right",
		bleed: 0.4,
		y: 5100,
		size: 1280,
		rotation: -18,
		color: "yellow",
	},
	{
		shape: 5,
		edge: "left",
		bleed: 0.38,
		y: 5680,
		size: 1240,
		rotation: 32,
		color: "rose",
	},
	{
		shape: 0,
		edge: "right",
		bleed: 0.36,
		y: 6250,
		size: 1180,
		rotation: -12,
		color: "mint",
	},
	{
		shape: 2,
		edge: "left",
		bleed: 0.42,
		y: 6840,
		size: 1260,
		rotation: -17,
		color: "peach",
	},
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
					[placement.edge]: `calc(var(--shape-size) * -${placement.bleed})`,
					top: `${placement.y}px`,
					rotate: `${placement.rotation}deg`,
					"--size": `${placement.size}px`,
					"--depth": index % 2 === 0 ? 1 : -0.7,
				};
				return (
					<svg
						aria-hidden="true"
						key={`${placement.shape}-${placement.edge}-${placement.y}`}
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
