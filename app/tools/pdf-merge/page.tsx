// app/tools/pdf-merge/page.tsx
"use client";

import Header from "@/app/components/header/wrapper";
import ActionButtons from "./components/actionButtons";
import DropOverlay from "./components/dropOverlay";
import { FileList } from "./components/fileList";
import { useGlobalDrag } from "./components/globalDrag";
import InfoModal from "./components/infoModal";
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
		setFiles,
	} = usePdfMerge();

	const { isDragging, isDraggingPDF } = useGlobalDrag({
		onDropFiles: addFiles,
	});

	return (
		<main className="min-h-screen">
			<Header />
			{isDragging && <DropOverlay isDraggingPDF={isDraggingPDF} />}
			<div className="h-16" />
			<div className="max-w-4xl mx-auto p-6">
				<h1 className="text-3xl font-bold mb-8 text-center">PDF統合ツール</h1>

				<div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 flex flex-col gap-6">
					<InfoModal />
					<UploadArea onChange={handleFileInputChange} />
					<FileList
						files={files}
						onRemove={removeFile}
						onReorder={(newFiles) => setFiles(newFiles)}
					/>
					<ActionButtons
						files={files}
						isLoading={isLoading}
						clearFiles={clearFiles}
						mergePdfs={mergePdfs}
					/>
				</div>
			</div>
		</main>
	);
}
