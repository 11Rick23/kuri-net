"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
	icon: React.ReactNode;
	children: React.ReactNode;
	ariaLabel: string;
	wrapperClassName?: string;
	triggerToneClassName?: string;
	contentToneClassName?: string;
	triggerClassName?: string;
	wrapContent?: boolean;
};

export default function ToolBadge({
	icon,
	children,
	ariaLabel,
	wrapperClassName = "",
	triggerToneClassName = "",
	contentToneClassName = "",
	triggerClassName = "",
	wrapContent = false,
}: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [isPinned, setIsPinned] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const closeOnOutsidePointer = (event: PointerEvent) => {
			if (
				event.target instanceof Node &&
				!wrapperRef.current?.contains(event.target)
			) {
				setIsPinned(false);
				setIsOpen(false);
			}
		};
		document.addEventListener("pointerdown", closeOnOutsidePointer, true);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
		};
	}, [isOpen]);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: tooltip hover state is managed on the wrapper to keep the popup open while moving between trigger and content
		<div
			ref={wrapperRef}
			className={[
				"relative inline-flex flex-col items-center",
				wrapperClassName,
			].join(" ")}
			onMouseEnter={() => {
				if (!isPinned) setIsOpen(true);
			}}
			onMouseLeave={() => {
				if (!isPinned) setIsOpen(false);
			}}
		>
			<button
				type="button"
				aria-label={ariaLabel}
				aria-expanded={isOpen}
				onFocus={() => {
					if (!isPinned) setIsOpen(true);
				}}
				onBlur={() => {
					if (!isPinned) setIsOpen(false);
				}}
				onClick={() => {
					if (isPinned) {
						setIsPinned(false);
						setIsOpen(false);
					} else {
						setIsPinned(true);
						setIsOpen(true);
					}
				}}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						setIsPinned(false);
						setIsOpen(false);
					}
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
					text-sm`,
					wrapContent ? "whitespace-normal" : "whitespace-nowrap",
					isOpen ? "block" : "hidden",
					contentToneClassName,
				].join(" ")}
			>
				{children}
			</div>
		</div>
	);
}
