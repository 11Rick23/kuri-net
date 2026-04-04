"use client";

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
			inline-flex items-center justify-center gap-2 rounded-full
			border border-ctp-surface1 bg-ctp-mantle
			px-4 py-2 transition
			text-sm font-semibold text-ctp-text
			hover:border-ctp-blue hover:text-ctp-blue hover:cursor-pointer"
		>
			コピー
		</button>
	);
}
