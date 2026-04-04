"use client";

import { useState } from "react";
import { useModal } from "@/shared/components/modal/modalProvider";

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
					rounded-full border border-ctp-surface1
					bg-ctp-base px-4 py-2
					text-sm font-semibold text-ctp-text
					transition
					hover:border-ctp-overlay1 hover:cursor-pointer
					disabled:cursor-not-allowed disabled:opacity-60"
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
					rounded-full border border-ctp-surface1
					bg-ctp-green px-4 py-2
					text-sm font-semibold text-ctp-crust
					transition
					hover:opacity-90 hover:border-ctp-overlay1 hover:cursor-pointer
					disabled:cursor-not-allowed disabled:opacity-60"
				>
					置き換える
				</button>
			</div>
		</div>
	);
}
