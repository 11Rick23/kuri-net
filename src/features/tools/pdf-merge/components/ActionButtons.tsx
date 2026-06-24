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
	const canMerge = files.length >= 2 && !isLoading;

	return (
		<div className="flex flex-col gap-3 sm:flex-row">
			<button
				type="button"
				onClick={mergePdfs}
				disabled={!canMerge}
				aria-busy={isLoading}
				className="
                min-h-12 flex-1 cursor-pointer rounded-lg bg-ctp-blue px-6 py-3
                font-semibold text-ctp-crust
                transition duration-200 hover:bg-ctp-sapphire
                active:scale-[0.98]
                disabled:cursor-not-allowed disabled:bg-ctp-surface1
                disabled:text-ctp-subtext0 disabled:hover:bg-ctp-surface1
                disabled:active:scale-100
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
                    min-h-12 cursor-pointer rounded-lg border border-ctp-surface1
                    bg-ctp-mantle px-6 py-3
                    font-semibold text-ctp-text
                    transition duration-200
                    hover:border-ctp-overlay0 hover:bg-ctp-surface0
                    active:scale-[0.98]
                    disabled:cursor-not-allowed disabled:opacity-60
                    disabled:active:scale-100
                    "
				>
					クリア
				</button>
			)}
		</div>
	);
}
