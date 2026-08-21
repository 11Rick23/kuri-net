import type { Metadata } from "next";
import MinesweeperPage from "@/features/tools/minesweeper/MinesweeperPage";
import { getToolDefinitionBySlug } from "@/features/tools/toolDefinitions";

const app = getToolDefinitionBySlug("minesweeper");

export const metadata: Metadata = {
	title: app?.title ?? "完全論理式マインスイーパー",
	description: app?.description,
};

export default function Minesweeper() {
	return <MinesweeperPage />;
}
