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
					</section>
				</Reveal>
				<WorksGrid works={worksData} />
			</PageContainer>
		</main>
	);
}
