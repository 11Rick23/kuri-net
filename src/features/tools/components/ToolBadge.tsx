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
	const [open, setOpen] = useState(false);

	return (
		<div
			className={[
				"group relative inline-flex flex-col items-center",
				wrapperClassName,
			].join(" ")}
		>
			<button
				type="button"
				aria-label={ariaLabel}
				aria-expanded={open}
				onClick={() => setOpen((prev) => !prev)}
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
					`absolute left-1/2 top-full z-50 -mt-2 -translate-x-1/2
					px-3 py-2 rounded-md
					bg-ctp-base text-center text-ctp-text
					border border-ctp-overlay0
					text-sm whitespace-nowrap shadow-sm`,
					open ? "block" : "hidden group-hover:block group-focus-within:block",
					contentToneClassName,
				].join(" ")}
			>
				{children}
			</div>
		</div>
	);
}
