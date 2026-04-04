import type React from "react";
import type { ToolBadgeDefinition } from "@/features/tools/badgeTemplates";
import ToolBadgeList from "@/features/tools/components/ToolBadgeList";

type ToolsPageFrameProps = {
	title: string;
	englishTitle?: string;
	description?: React.ReactNode;
	badges?: ToolBadgeDefinition[];
	children: React.ReactNode;
};

export default function ToolsPageFrame({
	title,
	englishTitle,
	description,
	badges = [],
	children,
}: ToolsPageFrameProps) {
	return (
		<main className="min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6">
			<div className="mx-auto flex max-w-6xl flex-col gap-8">
				<div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-start sm:justify-between">
					<div className="min-w-0 flex-1 space-y-3">
						{englishTitle && (
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-ctp-subtext0">
								{englishTitle}
							</p>
						)}
						<h1 className="text-4xl font-bold tracking-tight text-ctp-text">
							{title}
						</h1>
						{description && (
							<div className="max-w-3xl text-base leading-7 text-ctp-subtext1">
								{description}
							</div>
						)}
					</div>
					{badges.length > 0 && (
						<div className="shrink-0 pt-0.5">
							<ToolBadgeList badges={badges} />
						</div>
					)}
				</div>

				{children}
			</div>
		</main>
	);
}
