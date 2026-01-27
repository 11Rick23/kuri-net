// biome-ignore-all lint/a11y/noStaticElementInteractions: 背景クリックで閉じる処理
// biome-ignore-all lint/a11y/useKeyWithClickEvents: 背景クリックで閉じる処理

import { useEffect, useState } from "react";
import { MdClose, MdOutlineInfo } from "react-icons/md";

export default function InfoModal() {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpen(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [open]);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="
                absolute top-4 right-4 p-1
                rounded-full
                text-gray-500
                hover:bg-gray-200 dark:hover:bg-gray-700
                hover:cursor-pointer
                "
			>
				<MdOutlineInfo size={24} />
			</button>
			{open && (
				<div
					className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
					onClick={() => setOpen(false)}
				>
					<div
						className="relative bg-blue-50 dark:bg-slate-700 rounded-lg p-4"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="
                            absolute top-2 right-2 p-1
                            rounded-full
                            text-gray-500
                            hover:bg-gray-200 dark:hover:bg-gray-700
                            hover:cursor-pointer
                            "
						>
							<MdClose size={24} />
						</button>
						<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
							使い方
						</h3>
						<ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
							<li>PDFファイルを追加</li>
							<li>統合したい順序に並び替える</li>
							<li>「PDFを統合して保存」ボタンをクリック</li>
							<li>統合されたPDFファイルがダウンロードされます！</li>
						</ol>
					</div>
				</div>
			)}
		</>
	);
}
