// app/tools/pdf-merge/page.tsx
"use client";

import Header from "@/app/components/header/wrapper";
import DropOverlay from "./components/dropOverlay";
import { FileList } from "./components/fileList";
import { useGlobalDrag } from "./components/globalDrag";
import { usePdfMerge } from "./components/merge";
import { UploadArea } from "./components/uploadArea";

export default function PdfMerge() {
	const {
		files,
		isLoading,
		addFiles,
		handleFileInputChange,
		removeFile,
		clearFiles,
		mergePdfs,
	} = usePdfMerge();

	const { isDragging } = useGlobalDrag({
		onDropFiles: addFiles,
	});

	return (
		<main className="min-h-screen">
			<Header />
			{isDragging && <DropOverlay />}
			<div className="h-16" />
			<div className="max-w-4xl mx-auto p-6">
				<h1 className="text-3xl font-bold mb-8 text-center">PDF統合ツール</h1>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
					<UploadArea
						isDragging={isDragging}
						onChange={handleFileInputChange}
					/>

					<FileList files={files} onRemove={removeFile} />

					<div className="flex gap-4">
						<button
							type="button"
							onClick={mergePdfs}
							disabled={files.length < 2 || isLoading}
							className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
						>
							{isLoading ? "統合中..." : "PDFを統合してダウンロード"}
						</button>

						{files.length > 0 && (
							<button
								type="button"
								onClick={clearFiles}
								disabled={isLoading}
								className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
							>
								クリア
							</button>
						)}
					</div>
				</div>

				<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
					<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
						使い方
					</h3>
					<ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
						<li>
							「PDFファイルを選択」ボタンから統合したいPDFファイルを選択します
						</li>
						<li>複数のファイルを一度に選択できます（追加選択も可能）</li>
						<li>
							リスト内でファイルの順序を確認します（この順序で統合されます）
						</li>
						<li>「PDFを統合してダウンロード」ボタンをクリックします</li>
						<li>統合されたPDFファイルが自動的にダウンロードされます</li>
					</ol>
				</div>
			</div>
		</main>
	);
}
