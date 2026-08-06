import type { ToolBadgeDefinition } from "@/features/tools/badgeTemplates";

export type ToolDefinition = {
	id: string;
	slug: string;
	href: string;
	title: string;
	description: string;
	requiresAuth: boolean;
	badges: ToolBadgeDefinition[];
};

export const toolDefinitions: ToolDefinition[] = [
	{
		id: "minesweeper",
		slug: "minesweeper",
		href: "/apps/minesweeper",
		title: "完全論理式マインスイーパー",
		description:
			"論理的に安全と確定したマスだけを開いて進める、推測禁止のマインスイーパーです。",
		requiresAuth: false,
		badges: [
			{
				kind: "local",
				description: "盤面の生成とプレイはすべて端末内で動作します。",
			},
		],
	},
	{
		id: "pdf-merge",
		slug: "pdf-merge",
		href: "/apps/pdf-merge",
		title: "PDF統合",
		description: "複数のPDFファイルを1つのPDFファイルに結合します。",
		requiresAuth: false,
		badges: [
			{
				kind: "local",
				description: "このアプリは端末内で動作します。",
			},
		],
	},
	{
		id: "notepad",
		slug: "notepad",
		href: "/apps/notepad",
		title: "ちょこっとメモ",
		description: "超シンプルなメモ帳です。",
		requiresAuth: true,
		badges: [
			{
				kind: "requiresAuth",
				description: "このアプリを使うにはログインが必要です。",
			},
			{
				kind: "database",
				description: "このアプリはサーバー上にデータを保存します。",
			},
		],
	},
];

export function getToolDefinitionBySlug(slug: string) {
	return toolDefinitions.find((tool) => tool.slug === slug);
}
