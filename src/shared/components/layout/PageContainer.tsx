import type { ReactNode } from "react";

type PageContainerProps = {
	children: ReactNode;
	className?: string;
};

export default function PageContainer({
	children,
	className,
}: PageContainerProps) {
	return (
		<div
			className={["mx-auto flex w-full max-w-5xl flex-col", className]
				.filter(Boolean)
				.join(" ")}
		>
			{children}
		</div>
	);
}
