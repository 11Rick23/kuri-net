"use client";

import { MdContentPaste } from "react-icons/md";

export default function PasteButton({
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
			hover:border-ctp-green hover:bg-ctp-surface0 hover:text-ctp-green
			active:scale-[0.98]"
		>
			<MdContentPaste aria-hidden className="h-4 w-4 shrink-0" />
			貼り付け
		</button>
	);
}
