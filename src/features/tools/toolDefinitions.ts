import type { ToolBadgeDefinition } from "@/features/tools/badgeTemplates";

export type ToolDefinition = {
	id: string;
	slug: string;
	href: string;
	title: string;
	englishTitle: string;
	description: string;
	requiresAuth: boolean;
	badges: ToolBadgeDefinition[];
};

export const toolDefinitions: ToolDefinition[] = [
	{
		id: "pdf-merge",
		slug: "pdf-merge",
		href: "/tools/pdf-merge",
		title: "PDF統合",
		englishTitle: "Merge PDFs",
		description: "複数のPDFファイルを1つのPDFファイルに結合します。",
		requiresAuth: false,
		badges: [
			{
				kind: "local",
				description: "このツールは端末内で動作します。",
			},
		],
	},
	{
		id: "notepad",
		slug: "notepad",
		href: "/tools/notepad",
		title: "ちょこっとメモ",
		englishTitle: "Small Notepad",
		description: "超シンプルなメモ帳です。",
		requiresAuth: true,
		badges: [
			{
				kind: "requiresAuth",
				description: "このツールを使うにはログインが必要です。",
			},
			{
				kind: "database",
				description: "このツールはサーバー上にデータを保存します。",
			},
		],
	},
];

export function getToolDefinitionBySlug(slug: string) {
	return toolDefinitions.find((tool) => tool.slug === slug);
}
