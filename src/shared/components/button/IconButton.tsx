"use client";

type Props = {
	children: React.ReactNode;
	ariaLabel: string;
	onClick?: () => void;
	className?: string;
	disabled?: boolean;
	size?: "sm" | "md";
	tone?: "default" | "subtle";
	type?: "button" | "submit" | "reset";
};

const sizeClassName: Record<NonNullable<Props["size"]>, string> = {
	sm: "w-7 h-7",
	md: "w-9 h-9",
};

const toneClassName: Record<NonNullable<Props["tone"]>, string> = {
	default: "hover:bg-gray-300 dark:hover:bg-gray-700",
	subtle: "hover:bg-gray-200 dark:hover:bg-gray-700",
};

export default function IconButton({
	children,
	ariaLabel,
	onClick,
	className = "",
	disabled = false,
	size = "sm",
	tone = "default",
	type = "button",
}: Props) {
	return (
		<button
			type={type}
			aria-label={ariaLabel}
			onClick={onClick}
			disabled={disabled}
			className={[
				"inline-flex items-center justify-center rounded-full",
				sizeClassName[size],
				toneClassName[tone],
				disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
				className,
			].join(" ")}
		>
			{children}
		</button>
	);
}
