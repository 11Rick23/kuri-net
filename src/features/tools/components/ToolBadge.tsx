"use client";

import { useState } from "react";

type Props = {
	icon: React.ReactNode;
	children: React.ReactNode;
	ariaLabel: string;
	wrapperClassName?: string;
	triggerToneClassName?: string;
	contentToneClassName?: string;
};

export default function ToolBadge({
	icon,
	children,
	ariaLabel,
	wrapperClassName = "",
	triggerToneClassName = "",
	contentToneClassName = "",
}: Props) {
	const [open, setOpen] = useState(false);

	return (
		<div
			className={[
				"relative inline-flex flex-col items-center",
				wrapperClassName,
			].join(" ")}
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
		>
			<button
				type="button"
				aria-label={ariaLabel}
				onClick={() => setOpen((prev) => !prev)}
				className={[
					"inline-block rounded-full p-2 mb-4 cursor-help",
					triggerToneClassName,
				].join(" ")}
			>
				{icon}
			</button>

			{open && (
				<div
					className={[
						`absolute left-1/2 -translate-x-1/2 top-full -mt-2
						px-3 py-2 rounded-md
						bg-ctp-base text-center text-ctp-text
						border border-ctp-overlay0
						text-sm whitespace-nowrap shadow-sm z-50`,
						contentToneClassName,
					].join(" ")}
				>
					{children}
				</div>
			)}
		</div>
	);
}
