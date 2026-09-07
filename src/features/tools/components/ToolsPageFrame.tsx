import type React from "react";
import type { ToolBadgeDefinition } from "@/features/tools/badgeTemplates";
import ToolBadgeList from "@/features/tools/components/ToolBadgeList";
import PageContainer from "@/shared/components/layout/PageContainer";
import styles from "../Tools.module.css";

type ToolsPageFrameProps = {
	title: string;
	description?: React.ReactNode;
	badges?: ToolBadgeDefinition[];
	variant?: "index" | "app";
	children: React.ReactNode;
};

export default function ToolsPageFrame({
	title,
	description,
	badges = [],
	variant = "app",
	children,
}: ToolsPageFrameProps) {
	return (
		<main className={styles.frame}>
			<PageContainer className={styles.frameContent}>
				<div className={styles.frameHeader}>
					<div className={styles.frameCopy}>
						<h1
							className={variant === "index" ? "page-heading" : styles.appTitle}
						>
							{title}
						</h1>
						{description && (
							<div className={styles.frameDescription}>{description}</div>
						)}
					</div>
					{badges.length > 0 && (
						<div className={styles.frameBadges}>
							<ToolBadgeList badges={badges} />
						</div>
					)}
				</div>

				{children}
			</PageContainer>
		</main>
	);
}
