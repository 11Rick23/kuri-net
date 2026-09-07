"use client";

type Props = {
	children: React.ReactNode;
	ariaLabel: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	className?: string;
	disabled?: boolean;
	size?: "sm" | "md";
	tone?: "default" | "subtle";
	type?: "button" | "submit" | "reset";
};

const sizeClassName: Record<NonNullable<Props["size"]>, string> = {
	sm: "w-11 h-11",
	md: "w-12 h-12",
};

const toneClassName: Record<NonNullable<Props["tone"]>, string> = {
	default: "text-ctp-text hover:bg-ctp-text/10",
	subtle: "text-ctp-subtext1 hover:bg-ctp-subtext1/10",
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
				"inline-flex shrink-0 items-center justify-center rounded-md transition-colors duration-150",
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
