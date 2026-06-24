import type { ReactNode } from "react";

type FullscreenMessageProps = {
	backgroundLabel?: string;
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
	className?: string;
};

export default function FullscreenMessage({
	backgroundLabel,
	title,
	description,
	actions,
	className,
}: FullscreenMessageProps) {
	return (
		<section
			className={[
				"relative flex min-h-dvh w-full flex-col items-center justify-center gap-8 overflow-hidden px-4 py-24 text-center",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{backgroundLabel && (
				<div
					aria-hidden
					className="pointer-events-none absolute select-none text-[clamp(8rem,38vw,40rem)] font-bold leading-none text-ctp-lavender/10 blur-sm"
				>
					{backgroundLabel}
				</div>
			)}

			<div className="relative z-10 flex max-w-4xl flex-col items-center gap-5">
				<h1 className="text-[clamp(3rem,8vw,6rem)] font-bold leading-tight tracking-tight text-ctp-text text-balance">
					{title}
				</h1>
				{description && (
					<div className="max-w-3xl text-[clamp(1rem,2vw,1.5rem)] leading-8 text-ctp-subtext1 text-pretty">
						{description}
					</div>
				)}
				{actions && (
					<div className="mt-2 flex flex-wrap items-center justify-center gap-3">
						{actions}
					</div>
				)}
			</div>
		</section>
	);
}
