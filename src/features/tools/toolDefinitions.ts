export type ToolDefinition = {
	id: string;
	slug: string;
	title: string;
	description: string;
	href: string;
	requiresAuth: boolean;
};

export const toolDefinitions: ToolDefinition[] = [
	{
		id: "pdf-merge",
		slug: "pdf-merge",
		title: "PDF統合ツール",
		description: "複数のPDFファイルを1つのPDFファイルに結合します。",
		href: "/tools/pdf-merge",
		requiresAuth: false,
	},
	{
		id: "notepad",
		slug: "notepad",
		title: "ちょこっとメモ",
		description:
			"超シンプルなメモ帳です。",
		href: "/tools/notepad",
		requiresAuth: true,
	},
];
