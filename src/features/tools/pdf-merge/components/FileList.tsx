import { MdOutlineDragIndicator } from "react-icons/md";
import type { FileEntry } from "@/features/tools/pdf-merge/types";

type Props = {
	files: FileEntry[];
	onRemove: (id: string) => void;
	onReorder: (files: FileEntry[]) => void;
};

export function FileList({ files, onRemove, onReorder }: Props) {
	const handleDragStart = (
		e: React.DragEvent<HTMLLIElement>,
		index: number,
	) => {
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", index.toString());
	};

	const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
		e.preventDefault();
		const dragIndex = Number(e.dataTransfer.getData("text/plain"));
		if (Number.isNaN(dragIndex) || dragIndex === dropIndex) return;

		const updated = [...files];
		const [moved] = updated.splice(dragIndex, 1);
		updated.splice(dropIndex, 0, moved);
		onReorder(updated);
	};

	const formatFileSize = (size: number) =>
		size > 1024 * 1024
			? `${(size / 1024 / 1024).toFixed(2)} MB`
			: `${(size / 1024).toFixed(2)} KB`;

	if (files.length === 0) {
		return (
			<div className="rounded-lg border border-ctp-surface1 bg-ctp-mantle px-5 py-6 text-center">
				<p className="text-sm font-semibold text-ctp-text">
					まだPDFが選択されていません
				</p>
				<p className="mt-2 text-sm leading-6 text-ctp-subtext1">
					結合したいPDFを2件以上追加してください。
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-end justify-between gap-3">
				<h2 className="text-lg font-semibold tracking-tight text-ctp-text">
					選択されたファイル
				</h2>
				<p className="text-sm font-semibold text-ctp-subtext0">
					{files.length}件
				</p>
			</div>
			<ul className="space-y-2">
				{files.map(({ id, file }, index) => (
					<li
						key={id}
						draggable
						onDragStart={(e) => handleDragStart(e, index)}
						onDragOver={handleDragOver}
						onDrop={(e) => handleDrop(e, index)}
						className="
                        flex cursor-move items-center justify-between gap-3
                        rounded-lg border border-ctp-surface1 bg-ctp-mantle
                        px-3 py-3 transition duration-200
                        hover:border-ctp-overlay0 hover:bg-ctp-surface0
                        "
					>
						<div className="flex min-w-0 items-center gap-3">
							<MdOutlineDragIndicator
								size={20}
								aria-hidden
								className="hidden shrink-0 text-ctp-overlay0 sm:inline-block"
							/>
							<div className="min-w-0">
								<p
									className="truncate text-sm font-medium text-ctp-text"
									title={file.name}
								>
									{file.name}
								</p>
								<p className="mt-1 text-xs text-ctp-subtext0">
									{formatFileSize(file.size)}
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={() => onRemove(id)}
							className="
                            min-h-9 shrink-0 cursor-pointer rounded-md px-3 py-2 text-sm
                            font-semibold text-ctp-red transition duration-200
                            hover:bg-ctp-red/10 hover:text-ctp-maroon
                            active:scale-[0.98]
                            "
						>
							削除
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
