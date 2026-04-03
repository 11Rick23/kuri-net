import { MdOutlineDragIndicator } from "react-icons/md";
import type { FileEntry } from "@/features/tools/pdf-merge/types";

type Props = {
	files: FileEntry[];
	onRemove: (id: string) => void;
	onReorder: (files: FileEntry[]) => void;
};

export function FileList({ files, onRemove, onReorder }: Props) {
	if (files.length === 0) return null;

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

	return (
		<div>
			<h2 className="mb-3 text-lg font-semibold text-ctp-text">
				選択されたファイル ({files.length}件)
			</h2>
			<ul>
				{files.map(({ id, file }, index) => (
					<li
						key={id}
						draggable
						onDragStart={(e) => handleDragStart(e, index)}
						onDragOver={handleDragOver}
						onDrop={(e) => handleDrop(e, index)}
						className="
                        flex items-center justify-between
                        my-2 p-2
                        rounded-lg border border-ctp-overlay0
                        bg-ctp-surface0/30 cursor-move
                        "
					>
						<div className="flex items-center space-x-3">
							<MdOutlineDragIndicator
								size={20}
								className="hidden text-ctp-overlay0 sm:inline-block"
							/>
							<span
								className="
                            text-sm text-ctp-text truncate
                            max-w-32 sm:max-w-75 md:max-w-md lg:max-w-150
                            "
								title={file.name}
							>
								{file.name}
							</span>
							<span className="text-xs text-ctp-subtext0">
								{file.size > 1024 * 1024
									? `${(file.size / 1024 / 1024).toFixed(2)} MB`
									: `${(file.size / 1024).toFixed(2)} KB`}
							</span>
						</div>
						<button
							type="button"
							onClick={() => onRemove(id)}
							className="
                            text-ctp-red hover:text-ctp-maroon
                            hover:bg-ctp-surface0
                            text-sm font-medium px-2 py-1
                            rounded-md hover:cursor-pointer
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
