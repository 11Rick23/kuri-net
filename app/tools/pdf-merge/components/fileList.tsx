import { MdOutlineDragIndicator } from "react-icons/md";

type Props = {
	files: File[];
	onRemove: (index: number) => void;
	onReorder: (files: File[]) => void;
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
			<h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
				選択されたファイル ({files.length}件)
			</h2>
			<ul>
				{files.map((file, index) => (
					<li
						key={`${file.name}-${index}`}
						draggable
						onDragStart={(e) => handleDragStart(e, index)}
						onDragOver={handleDragOver}
						onDrop={(e) => handleDrop(e, index)}
						className="
						flex items-center justify-between
						my-2 p-2
						bg-gray-100 dark:bg-gray-700
						rounded-lg cursor-move
						"
					>
						<div className="flex items-center space-x-3">
							<MdOutlineDragIndicator
								size={20}
								className="text-gray-500 dark:text-gray-400 hidden sm:inline-block"
							/>
							{/* <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								{index + 1}.
							</span> */}
							<span
								className="
							text-sm text-gray-900 dark:text-white truncate
							max-w-[130px] sm:max-w-[300px] md:max-w-[450px] lg:max-w-[600px]
							"
								title={file.name}
							>
								{file.name}
							</span>
							<span className="text-xs text-gray-500 dark:text-gray-400">
								{file.size > 1024 * 1024
									? `${(file.size / 1024 / 1024).toFixed(2)} MB`
									: `${(file.size / 1024).toFixed(2)} KB`}
							</span>
						</div>
						<button
							type="button"
							onClick={() => onRemove(index)}
							className="
							text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300
							hover:bg-gray-300 dark:hover:bg-gray-600
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
