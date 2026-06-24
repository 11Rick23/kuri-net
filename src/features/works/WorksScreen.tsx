import WorksGrid from "@/features/works/components/WorksGrid";
import { worksData } from "@/features/works/data/worksData";
import PageContainer from "@/shared/components/layout/PageContainer";

export default function WorksScreen() {
	return (
		<main className="min-h-screen px-4 pb-12 pt-24 sm:px-6 sm:pb-16">
			<PageContainer className="gap-8">
				<section className="space-y-3 px-1">
					<p className="text-xs font-semibold uppercase tracking-[0.28em] text-ctp-subtext0">
						Works
					</p>
					<h1 className="text-3xl font-bold tracking-tight text-ctp-text sm:text-4xl">
						制作実績
					</h1>
					<p className="text-sm leading-7 text-ctp-subtext1 text-pretty sm:text-base">
						個人開発とチーム開発で取り組んだプロジェクトをまとめています。カードを開くと、担当範囲や使用技術、制作の背景を確認できます。
					</p>
				</section>

				<div className="h-px w-full bg-ctp-surface1" />

				<WorksGrid works={worksData} />
			</PageContainer>
		</main>
	);
}
