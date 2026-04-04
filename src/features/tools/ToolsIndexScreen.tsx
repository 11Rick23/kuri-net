import Link from "next/link";
import { toolDefinitions } from "@/features/tools/toolDefinitions";

export default function ToolsIndexScreen() {
	return (
		<main className="min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6">
			<div className="mx-auto flex max-w-6xl flex-col gap-8">
				<div className="space-y-3 px-1">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-ctp-subtext0">
						Tools
					</p>
					<h1 className="text-4xl font-bold tracking-tight text-ctp-text">
						ツール一覧
					</h1>
					<p className="max-w-3xl text-base leading-7 text-ctp-subtext1">
						ちょっとした便利ツールを提供しています。随時追加予定です。
					</p>
				</div>

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
			</div>
		</main>
	);
}
