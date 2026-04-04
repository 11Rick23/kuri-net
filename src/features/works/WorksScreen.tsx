import WorksGrid from "@/features/works/components/WorksGrid";
import { worksData } from "@/features/works/data/worksData";

const focusAreas = [
	"設計から実装まで一貫して進めるフルスタック開発",
	"使い勝手と情報設計を両立するUIづくり",
	"小さく育てながら拡張しやすい基盤設計",
];

const deliverables = [
	"個人開発のWebアプリ",
	"認証つきのツールや業務補助UI",
	"読み物としても伝わるポートフォリオ導線",
];

const strengthTags = [
	"TypeScript",
	"Next.js",
	"React",
	"UI Design",
	"WebAuthn",
	"Feature設計",
];

export default function WorksScreen() {
	return (
		<main className="min-h-screen px-4 pb-10 pt-24 sm:px-6 sm:pb-14">
			<div className="mx-auto flex max-w-6xl flex-col gap-8">
				<section className="overflow-hidden rounded-[2rem] border border-ctp-surface1 bg-gradient-to-br from-ctp-base via-ctp-mantle to-ctp-crust shadow-light dark:shadow-dark">
					<div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.95fr)] lg:items-start">
						<div className="space-y-5">
							<p className="text-sm font-semibold uppercase tracking-[0.28em] text-ctp-subtext0">
								Works
							</p>
							<div className="space-y-4">
								<h1 className="max-w-4xl text-4xl font-bold tracking-tight text-ctp-text sm:text-5xl">
									作ったものと、その裏側にある設計や判断まで伝えるためのページです。
								</h1>
								<p className="max-w-3xl text-base leading-8 text-ctp-subtext1 sm:text-lg">
									見た目の雰囲気だけではなく、どういう課題を見つけて、どう整理し、どう実装に落としているかまで読める構成にしています。カードでは要点を、詳細では制作の背景と工夫をまとめています。
								</p>
							</div>
						</div>

						<div className="rounded-[1.75rem] border border-ctp-surface1/85 bg-ctp-base/80 p-5 backdrop-blur-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-ctp-subtext0">
								Strengths
							</p>
							<div className="mt-4 flex flex-wrap gap-2">
								{strengthTags.map((tag) => (
									<span
										key={tag}
										className="rounded-full bg-ctp-blue/12 px-3 py-1 text-xs font-semibold text-ctp-blue"
									>
										{tag}
									</span>
								))}
							</div>
						</div>
					</div>
				</section>

				<section className="grid gap-5 lg:grid-cols-2">
					<div className="rounded-[1.75rem] border border-ctp-surface1 bg-ctp-base p-6 shadow-light dark:shadow-dark">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-ctp-subtext0">
							Focus Areas
						</p>
						<h2 className="mt-3 text-2xl font-bold tracking-tight text-ctp-text">
							得意領域
						</h2>
						<ul className="mt-4 space-y-3 text-sm leading-7 text-ctp-subtext1">
							{focusAreas.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>

					<div className="rounded-[1.75rem] border border-ctp-surface1 bg-ctp-base p-6 shadow-light dark:shadow-dark">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-ctp-subtext0">
							Can Build
						</p>
						<h2 className="mt-3 text-2xl font-bold tracking-tight text-ctp-text">
							作れるもの
						</h2>
						<ul className="mt-4 space-y-3 text-sm leading-7 text-ctp-subtext1">
							{deliverables.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>
				</section>

				<section className="space-y-4">
					<div className="space-y-2 px-1">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-ctp-subtext0">
							Case Studies
						</p>
						<h2 className="text-3xl font-bold tracking-tight text-ctp-text">
							制作実績
						</h2>
						<p className="max-w-3xl text-sm leading-7 text-ctp-subtext1 sm:text-base">
							クリックすると、背景・課題・設計意図・成果までを記事のように読めます。
						</p>
					</div>

					<WorksGrid works={worksData} />
				</section>
			</div>
		</main>
	);
}
