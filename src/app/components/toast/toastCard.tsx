import type { ToastItem, ToastType } from "@/utils/types";

export default function ToastCard({
	item,
	onClose,
}: {
	item: ToastItem;
	onClose: () => void;
}) {
	const colorByType: Record<ToastType, string> = {
		info: "border-gray-500 dark:border-gray-800",
		success: "border-green-500 dark:border-green-800",
		warning: "border-yellow-500 dark:border-yellow-800",
		error: "border-red-500 dark:border-red-800",
	};

	return (
		<div
			className={`
                rounded-sm border
                px-3 py-3 flex items-start gap-3
				bg-white dark:bg-gray-900
                ${colorByType[item.type]} border-2
                `}
		>
			<div className="text-sm text-gray-900 dark:text-gray-100 flex-1">
				{item.message}
			</div>
			<button
				type="button"
				onClick={onClose}
				className="text-xs px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
				aria-label="閉じる"
			>
				✕
			</button>
		</div>
	);
}
