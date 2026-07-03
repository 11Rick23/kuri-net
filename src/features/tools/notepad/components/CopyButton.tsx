"use client";

import { MdContentCopy } from "react-icons/md";

export default function CopyButton({
	onClick,
}: {
	onClick: () => void | Promise<void>;
}) {
	return (
		<button
			type="button"
			onClick={() => {
				void onClick();
			}}
			className="
			inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg
			border border-ctp-surface1 bg-ctp-mantle
			px-4 py-2 transition duration-200
			text-sm font-semibold text-ctp-text
			hover:border-ctp-blue hover:bg-ctp-surface0 hover:text-ctp-blue
			active:scale-[0.98]"
		>
			<MdContentCopy aria-hidden className="h-4 w-4 shrink-0" />
			コピー
		</button>
	);
}
