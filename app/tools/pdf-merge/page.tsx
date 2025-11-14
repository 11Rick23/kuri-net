"use client";

import { Group, Text } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import Header from "@/app/components/header/wrapper";

export default function PdfMerge() {
	const [files, setFiles] = useState<File[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const fileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const newFiles = Array.from(e.target.files).filter(
				(file) => file.type === "application/pdf",
			);
			setFiles((prevFiles) => [...prevFiles, ...newFiles]);
		}
	};

	const removeFile = (index: number) => {
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
	};

	const mergePdfs = async () => {
		if (files.length < 2) {
			alert("統合するには少なくとも2つのPDFファイルが必要です。");
			return;
		}

		setIsLoading(true);

		try {
			const mergedPdf = await PDFDocument.create();

			for (const file of files) {
				const arrayBuffer = await file.arrayBuffer();
				const pdf = await PDFDocument.load(arrayBuffer);
				const copiedPages = await mergedPdf.copyPages(
					pdf,
					pdf.getPageIndices(),
				);

				for (const page of copiedPages) {
					mergedPdf.addPage(page);
				}
			}

			const mergedPdfBytes = await mergedPdf.save();
			const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], {
				type: "application/pdf",
			});
			const url = URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = `merged_${Date.now()}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			setFiles([]);
		} catch (error) {
			console.error("PDF統合エラー:", error);
			alert("PDFの統合中にエラーが発生しました。");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className="min-h-screen">
			<Header />
			<div className="h-16" />
			<div className="max-w-4xl mx-auto p-6">
				<h1 className="text-3xl font-bold mb-8 text-center">PDF統合ツール</h1>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
					<div className="mb-6">
						<label
							htmlFor="pdf-upload"
							className="block pb-2 text-sm font-medium text-gray-900 dark:text-white"
						>
							PDFファイルを選択
						</label>

						<input
							id="pdf-upload"
							type="file"
							accept="application/pdf"
							multiple
							onChange={fileChange}
							className="
                                block w-full text-sm rounded-lg cursor-pointer
                                text-gray-900 dark:text-gray-400
                                border border-gray-300 dark:border-gray-600
                                bg-gray-50 dark:bg-gray-700
                            "
						/>

						<p className="text-sm pt-2 text-gray-500 dark:text-gray-400">
							複数のPDFファイルを選択できます
						</p>
					</div>

					{files.length > 0 && (
						<div className="mb-6">
							<h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
								選択されたファイル ({files.length}件)
							</h2>
							<ul className="space-y-2">
								{files.map((file, index) => (
									<li
										key={`${file.name}-${index}`}
										className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
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
											onClick={() => removeFile(index)}
											className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
										>
											削除
										</button>
									</li>
								))}
							</ul>
						</div>
					)}

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
								onClick={() => setFiles([])}
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
