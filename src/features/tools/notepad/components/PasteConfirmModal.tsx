"use client";

import { useState } from "react";
import { useModal } from "@/shared/components/modal/ModalProvider";

export default function PasteConfirmModal({
	onConfirm,
}: {
	onConfirm: () => Promise<void>;
}) {
	const { closeModal } = useModal();
	const [isSubmitting, setIsSubmitting] = useState(false);

	return (
		<div className="w-[min(92vw,28rem)] space-y-5">
			<header className="space-y-2 pr-8">
				<h2 className="text-2xl font-bold text-ctp-text">
					内容を置き換えますか？
				</h2>
				<p className="text-sm leading-6 text-ctp-subtext1">
					現在入力されているメモは、クリップボードの内容で上書きされます。
				</p>
			</header>

			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={closeModal}
					disabled={isSubmitting}
					className="
					min-h-10 cursor-pointer rounded-lg border border-ctp-surface1
					bg-ctp-base px-4 py-2
					text-sm font-semibold text-ctp-text
					transition duration-200
					hover:border-ctp-overlay1 hover:bg-ctp-mantle
					active:scale-[0.98]
					disabled:cursor-not-allowed disabled:opacity-60
					disabled:active:scale-100"
				>
					キャンセル
				</button>
				<button
					type="button"
					disabled={isSubmitting}
					onClick={async () => {
						setIsSubmitting(true);
						closeModal();
						await onConfirm();
					}}
					className="
					min-h-10 cursor-pointer rounded-lg border border-ctp-surface1
					bg-ctp-green px-4 py-2
					text-sm font-semibold text-ctp-crust
					transition duration-200
					hover:border-ctp-overlay1 hover:opacity-90
					active:scale-[0.98]
					disabled:cursor-not-allowed disabled:opacity-60
					disabled:active:scale-100"
				>
					置き換える
				</button>
			</div>
		</div>
	);
}
