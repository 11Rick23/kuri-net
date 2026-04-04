import Link from "next/link";
import ToolsPageFrame from "@/features/tools/components/ToolsPageFrame";
import { toolDefinitions } from "@/features/tools/toolDefinitions";

export default function ToolsIndexScreen() {
	return (
		<ToolsPageFrame
			title="ツール一覧"
			englishTitle="Tools"
			description="ちょっとした便利ツールを提供しています。随時追加予定です。"
		>
			<div className="grid gap-4 md:grid-cols-2">
				{toolDefinitions.map((tool) => (
					<Link
						key={tool.id}
						href={tool.href}
						className="group rounded-[1.75rem] border border-ctp-surface1 bg-ctp-base p-6 shadow-light transition hover:-translate-y-0.5 hover:border-ctp-blue/40 hover:bg-ctp-mantle dark:shadow-dark"
					>
						<div className="flex h-full flex-col gap-4">
							<div className="space-y-2">
								<h2 className="text-2xl font-bold text-ctp-text">
									{tool.title}
								</h2>
								<p className="text-sm leading-7 text-ctp-subtext1">
									{tool.description}
								</p>
							</div>

							<div className="mt-auto pt-2 text-sm font-semibold text-ctp-blue transition group-hover:translate-x-1">
								ツールを開く →
							</div>
						</div>
					</Link>
				))}
			</div>
		</ToolsPageFrame>
	);
}
