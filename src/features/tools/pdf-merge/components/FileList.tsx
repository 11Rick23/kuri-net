import { useState } from "react";
import { MdOutlineDragIndicator } from "react-icons/md";
import {
	formatFileSize,
	PDF_REORDER_DATA_TYPE,
	parseReorderIndex,
	reorderFileEntries,
} from "@/features/tools/pdf-merge/domain/pdfFiles";
import type { FileEntry } from "@/features/tools/pdf-merge/types";

type Props = {
	files: FileEntry[];
	disabled?: boolean;
	onRemove: (id: string) => void;
	onReorder: (files: FileEntry[]) => void;
};

export function FileList({
	files,
	disabled = false,
	onRemove,
	onReorder,
}: Props) {
	const [reorderAnnouncement, setReorderAnnouncement] = useState("");

	const commitReorder = (fromIndex: number, toIndex: number) => {
		if (disabled) {
			return;
		}

		const movedEntry = files[fromIndex];
		const reordered = reorderFileEntries(files, fromIndex, toIndex);

		if (!movedEntry || !reordered) {
			return;
		}

		onReorder(reordered);
		setReorderAnnouncement(
			`${movedEntry.file.name}を${toIndex + 1}番目に移動しました。`,
		);
	};

	const handleDragStart = (
		e: React.DragEvent<HTMLLIElement>,
		index: number,
	) => {
		if (disabled) {
			return;
		}

		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData(PDF_REORDER_DATA_TYPE, index.toString());
	};

	const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
		if (
			disabled ||
			!Array.from(e.dataTransfer.types).includes(PDF_REORDER_DATA_TYPE)
		) {
			return;
		}

		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
		if (
			disabled ||
			!Array.from(e.dataTransfer.types).includes(PDF_REORDER_DATA_TYPE)
		) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		const dragIndex = parseReorderIndex(
			e.dataTransfer.getData(PDF_REORDER_DATA_TYPE),
			files.length,
		);

		if (dragIndex === null) {
			return;
		}

		commitReorder(dragIndex, dropIndex);
	};

	if (files.length === 0) {
		return (
			<div className="px-1 py-4 text-center">
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
			<p aria-live="polite" aria-atomic="true" className="sr-only">
				{reorderAnnouncement}
			</p>
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
						draggable={!disabled}
						aria-disabled={disabled}
						onDragStart={(e) => handleDragStart(e, index)}
						onDragOver={handleDragOver}
						onDrop={(e) => handleDrop(e, index)}
						className={`
						flex items-center justify-between gap-3
						rounded-lg border border-ctp-surface1 bg-ctp-mantle
						px-3 py-3 transition duration-200
						hover:border-ctp-overlay0 hover:bg-ctp-surface0
						${disabled ? "cursor-not-allowed opacity-60" : "cursor-move"}
						`}
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
						<div className="flex shrink-0 items-center gap-1">
							<button
								type="button"
								onClick={() => commitReorder(index, index - 1)}
								disabled={disabled || index === 0}
								aria-label={`${file.name}を上へ移動`}
								className="min-h-9 min-w-9 rounded-md text-sm font-semibold text-ctp-subtext1 transition hover:bg-ctp-surface0 hover:text-ctp-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ctp-blue disabled:cursor-not-allowed disabled:opacity-35"
							>
								↑
							</button>
							<button
								type="button"
								onClick={() => commitReorder(index, index + 1)}
								disabled={disabled || index === files.length - 1}
								aria-label={`${file.name}を下へ移動`}
								className="min-h-9 min-w-9 rounded-md text-sm font-semibold text-ctp-subtext1 transition hover:bg-ctp-surface0 hover:text-ctp-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ctp-blue disabled:cursor-not-allowed disabled:opacity-35"
							>
								↓
							</button>
							<button
								type="button"
								onClick={() => onRemove(id)}
								disabled={disabled}
								className="
                            min-h-9 shrink-0 cursor-pointer rounded-md px-3 py-2 text-sm
                            font-semibold text-ctp-red transition duration-200
                            hover:bg-ctp-red/10 hover:text-ctp-maroon
                            active:scale-[0.98]
                            focus-visible:outline-2 focus-visible:outline-offset-2
                            focus-visible:outline-ctp-blue
							disabled:cursor-not-allowed disabled:opacity-40
                            "
							>
								削除
							</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
