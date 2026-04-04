"use client";

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
			inline-flex items-center justify-center gap-2 rounded-full
			border border-ctp-surface1 bg-ctp-mantle
			px-4 py-2 transition
			text-sm font-semibold text-ctp-text
			hover:border-ctp-green hover:text-ctp-green hover:cursor-pointer"
		>
			貼り付け
		</button>
	);
}
