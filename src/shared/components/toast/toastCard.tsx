import React from "react";
import {
	FaCheck,
	FaExclamationCircle,
	FaExclamationTriangle,
	FaInfo,
} from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import IconButton from "@/shared/components/button/IconButton";
import type { ToastItem, ToastType } from "@/shared/types/toast";
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
		info: "border-ctp-sky",
		success: "border-ctp-green",
		warning: "border-ctp-yellow",
		error: "border-ctp-red",
	};

	const barColorByType: Record<ToastType, string> = {
		info: "bg-ctp-sky/80",
		success: "bg-ctp-green",
		warning: "bg-ctp-yellow",
		error: "bg-ctp-red",
	};

	const iconByType: Record<ToastType, React.ReactNode> = {
		info: <FaInfo aria-hidden className="text-ctp-sky" />,
		success: <FaCheck aria-hidden className="text-ctp-green" />,
		warning: (
			<FaExclamationTriangle aria-hidden className="text-ctp-yellow" />
		),
		error: (
			<FaExclamationCircle aria-hidden className="text-ctp-red" />
		),
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: ホバー時に自動的に消えるのを一時停止するため
		<div
			className={`
                relative overflow-hidden
                rounded-sm border
                px-3 py-3 flex items-start gap-3
                bg-ctp-mantle
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

			<div className="text-sm text-ctp-text flex-1">
				{item.message}
				{item.count > 1 && <span> ({item.count})</span>}
			</div>

			<IconButton
				ariaLabel="閉じる"
				onClick={onClose}
				className="rounded-md text-center text-2xl hover:bg-ctp-surface0"
			>
				<IoIosClose />
			</IconButton>
		</div>
	);
}
