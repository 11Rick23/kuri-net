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
				rounded-lg
				bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-gray-700
				hover:bg-blue-700 hover:cursor-pointer disabled:cursor-not-allowed
				text-white font-semibold
				py-3 px-6
				"
			>
				{isLoading ? "統合中..." : "PDFを統合して保存"}
			</button>

			{files.length > 0 && (
				<button
					type="button"
					onClick={clearFiles}
					disabled={isLoading}
					className="
					rounded-lg
					bg-gray-300 dark:bg-gray-600 disabled:bg-gray-400
					hover:cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-700 disabled:cursor-not-allowed
					text-black dark:text-white font-semibold
					py-3 px-6
					"
				>
					クリア
				</button>
			)}
		</div>
	);
}
