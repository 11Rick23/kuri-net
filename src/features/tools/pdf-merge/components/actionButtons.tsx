import type { FileEntry } from "@/features/tools/pdf-merge/types";

type Props = {
	files: FileEntry[];
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
                flex-1 rounded-lg py-3 px-6
                bg-ctp-blue disabled:bg-ctp-blue-100 hover:bg-ctp-blue/90 
				hover:cursor-pointer disabled:cursor-not-allowed
                text-ctp-crust disabled:text-ctp-crust/50 font-semibold
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
                    bg-ctp-surface1 disabled:bg-ctp-surface1
                    hover:cursor-pointer hover:bg-ctp-surface1/80 disabled:cursor-not-allowed
                    text-ctp-text font-semibold
                    py-3 px-6
                    "
				>
					クリア
				</button>
			)}
		</div>
	);
}
