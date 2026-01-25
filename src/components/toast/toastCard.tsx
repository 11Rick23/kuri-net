import React from "react";
import {
	FaCheck,
	FaExclamationCircle,
	FaExclamationTriangle,
	FaInfo,
} from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import type { ToastItem, ToastType } from "@/types/toast";
import { useToast } from "./toastProvider";

export default function ToastCard({
	item,
	onClose,
}: {
	item: ToastItem;
	onClose: () => void;
}) {
	const { pause, resume } = useToast();
	const [hovered, setHovered] = React.useState(false);

	const borderColorByType: Record<ToastType, string> = {
		info: "border-gray-400 dark:border-gray-600",
		success: "border-green-500 dark:border-green-800",
		warning: "border-yellow-500 dark:border-yellow-800",
		error: "border-red-500 dark:border-red-800",
	};

	const barColorByType: Record<ToastType, string> = {
		info: "bg-gray-400/70 dark:bg-gray-600/70",
		success: "bg-green-500 dark:bg-green-800",
		warning: "bg-yellow-500 dark:bg-yellow-800",
		error: "bg-red-500 dark:bg-red-800",
	};

	const iconByType: Record<ToastType, React.ReactNode> = {
		info: <FaInfo aria-hidden className="text-gray-400 dark:text-gray-400" />,
		success: (
			<FaCheck aria-hidden className="text-green-600 dark:text-green-400" />
		),
		warning: (
			<FaExclamationTriangle
				aria-hidden
				className="text-yellow-600 dark:text-yellow-400"
			/>
		),
		error: (
			<FaExclamationCircle
				aria-hidden
				className="text-red-600 dark:text-red-400"
			/>
		),
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: ホバー時に自動的に消えるのを一時停止するため
		<div
			className={`
				relative overflow-hidden
                rounded-sm border
                px-3 py-3 flex items-start gap-3
				bg-white dark:bg-gray-900
                ${borderColorByType[item.type]} border-2
                `}
			onMouseEnter={() => {
				setHovered(true);
				pause(item.id);
			}}
			onMouseLeave={() => {
				setHovered(false);
				resume(item.id);
			}}
		>
			<div className="absolute left-0 top-0 h-1 w-full overflow-hidden">
				<div
					className={`h-full w-full origin-left ${barColorByType[item.type]}`}
					style={{
						animationName: "progress-bar",
						animationDuration: `${item.durationMs}ms`,
						animationTimingFunction: "ease-in-out",
						animationFillMode: "forwards",
						animationPlayState: hovered ? "paused" : "running",
					}}
				/>
			</div>

			<div className="mt-0.5 text-lg shrink-0">{iconByType[item.type]}</div>

			<div className="text-sm text-gray-900 dark:text-gray-100 flex-1">
				{item.message}
				{item.count > 1 && <span> ({item.count})</span>}
			</div>

			<button
				type="button"
				onClick={onClose}
				className="text-2xl text-center rounded-md hover:bg-black/15 dark:hover:bg-white/20 cursor-pointer"
				aria-label="閉じる"
			>
				<IoIosClose />
			</button>
		</div>
	);
}
