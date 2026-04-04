import NotepadEditor from "@/features/tools/notepad/components/NotepadEditor";

export default function NotepadScreen({
	initialContent,
	initialUpdatedAt,
}: {
	initialContent: string;
	initialUpdatedAt: string | null;
}) {
	return (
		<main className="min-h-screen">
			<div className="h-16" />
			<div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
				<div className="space-y-3 px-1">
					<h1 className="text-4xl font-bold tracking-tight text-ctp-text">
						ちょこっとメモ
					</h1>
					<p className="max-w-2xl text-md leading-6 text-ctp-subtext1">
						超シンプルなメモ帳です。
						<br />
						テキストのみ入力が可能で、自動でアカウントへ保存されます。
						<br />
						複数のメモを作成することはできません。
					</p>
				</div>

				<NotepadEditor
					initialContent={initialContent}
					initialUpdatedAt={initialUpdatedAt}
				/>
			</div>
		</main>
	);
}
