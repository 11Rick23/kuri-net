type Props = {
	files: File[];
	onRemove: (index: number) => void;
};

export function FileList({ files, onRemove }: Props) {
	if (files.length === 0) return null;

	return (
		<div>
			<h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
				選択されたファイル ({files.length}件)
			</h2>
			<ul className="space-y-2">
				{files.map((file, index) => (
					<li
						key={`${file.name}-${index}`}
						className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
					>
						<div className="flex items-center space-x-3">
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								{index + 1}.
							</span>
							<span className="text-sm text-gray-900 dark:text-white">
								{file.name}
							</span>
							<span className="text-xs text-gray-500 dark:text-gray-400">
								({(file.size / 1024).toFixed(2)} KB)
							</span>
						</div>
						<button
							type="button"
							onClick={() => onRemove(index)}
							className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
						>
							削除
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}