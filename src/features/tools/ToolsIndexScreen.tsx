import Link from "next/link";
import ToolsPageFrame from "@/features/tools/components/ToolsPageFrame";
import { toolDefinitions } from "@/features/tools/toolDefinitions";
import Reveal from "@/shared/components/motion/Reveal";
import styles from "./Tools.module.css";

export default function ToolsIndexScreen() {
	return (
		<ToolsPageFrame
			title="アプリ一覧"
			description="ちょっとした便利なウェブアプリを提供しています。随時追加予定です。"
			variant="index"
		>
			<Reveal className={styles.appList}>
				{toolDefinitions.map((tool) => (
					<Link key={tool.id} href={tool.href} className={styles.appRow}>
						<div className={styles.appCopy}>
							<h2>{tool.title}</h2>
							<p>{tool.description}</p>
						</div>
						<div className={styles.appAction}>アプリを開く →</div>
					</Link>
				))}
			</Reveal>
		</ToolsPageFrame>
	);
}
