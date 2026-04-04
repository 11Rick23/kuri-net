"use client";

import { useState } from "react";

type Props = {
	icon: React.ReactNode;
	children: React.ReactNode;
	ariaLabel: string;
	wrapperClassName?: string;
	triggerToneClassName?: string;
	contentToneClassName?: string;
	triggerClassName?: string;
};

export default function ToolBadge({
	icon,
	children,
	ariaLabel,
	wrapperClassName = "",
	triggerToneClassName = "",
	contentToneClassName = "",
	triggerClassName = "",
}: Props) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: tooltip hover state is managed on the wrapper to keep the popup open while moving between trigger and content
		<div
			className={[
				"relative inline-flex flex-col items-center",
				wrapperClassName,
			].join(" ")}
			onMouseEnter={() => {
				setIsOpen(true);
			}}
			onMouseLeave={() => {
				setIsOpen(false);
			}}
		>
			<button
				type="button"
				aria-label={ariaLabel}
				aria-expanded={isOpen}
				onClick={() => {
					setIsOpen((prev) => !prev);
				}}
				className={[
					"inline-flex items-center justify-center rounded-full p-2 cursor-help",
					triggerToneClassName,
					triggerClassName,
				].join(" ")}
			>
				{icon}
			</button>

			<div
				className={[
					`absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2
					px-3 py-2 rounded-md
					bg-ctp-base text-center text-ctp-text
					border border-ctp-overlay0
					text-sm whitespace-nowrap shadow-sm`,
					isOpen ? "block" : "hidden",
					contentToneClassName,
				].join(" ")}
			>
				{children}
			</div>
		</div>
	);
}
