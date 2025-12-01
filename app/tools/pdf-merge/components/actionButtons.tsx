type Props = {
	files: File[];
	isLoading: boolean;
	clearFiles: () => void;
	mergePdfs: () => Promise<void>;
};
export default function ActionButtons({
	files,
	isLoading,
	clearFiles,
	mergePdfs,
}: Props) {
	return (
		<div className="flex gap-4">
			<button
				type="button"
				onClick={mergePdfs}
				disabled={files.length < 2 || isLoading}
				className="
				flex-1
				bg-blue-600 hover:bg-blue-700
				disabled:bg-blue-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
				text-white font-semibold
				py-3 px-6
				rounded-lg transition-colors
				"
			>
				{isLoading ? "統合中..." : "PDFを統合してダウンロード"}
			</button>

			{files.length > 0 && (
				<button
					type="button"
					onClick={clearFiles}
					disabled={isLoading}
					className="
					bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed
					text-white font-semibold
					py-3 px-6
					rounded-lg transition-colors
					"
				>
					クリア
				</button>
			)}
		</div>
	);
}
