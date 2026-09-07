import WorksGrid from "@/features/works/components/WorksGrid";
import { worksData } from "@/features/works/data/worksData";
import PageContainer from "@/shared/components/layout/PageContainer";
import Reveal from "@/shared/components/motion/Reveal";
import styles from "./works.module.css";

export default function WorksScreen() {
	return (
		<main className="page-shell">
			<PageContainer className={styles.screen}>
				<Reveal>
					<section className={styles.introduction}>
						<h1 className="page-heading">制作実績</h1>
						<p className="page-intro">
							個人開発とチーム開発で取り組んだプロジェクトをまとめています。カードを開くと、担当範囲や使用技術、制作の背景を確認できます。
						</p>
					</section>
				</Reveal>
				<WorksGrid works={worksData} />
			</PageContainer>
		</main>
	);
}
