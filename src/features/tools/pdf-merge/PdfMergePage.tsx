"use client";

import ActionButtons from "@/features/tools/pdf-merge/components/actionButtons";
import Badges from "@/features/tools/pdf-merge/components/badges";
import DropOverlay from "@/features/tools/pdf-merge/components/dropOverlay";
import { FileList } from "@/features/tools/pdf-merge/components/fileList";
import InfoModal from "@/features/tools/pdf-merge/components/infoModal";
import { UploadArea } from "@/features/tools/pdf-merge/components/uploadArea";
import { useGlobalDrag } from "@/features/tools/pdf-merge/hooks/useGlobalDrag";
import { usePdfMerge } from "@/features/tools/pdf-merge/hooks/usePdfMerge";

export default function PdfMergePage() {
	const {
		files,
		isLoading,
		addFiles,
		handleFileInputChange,
		removeFile,
		clearFiles,
		reorderFiles,
		mergePdfs,
	} = usePdfMerge();

	const { isDragging, isDraggingPDF } = useGlobalDrag({
		onDropFiles: addFiles,
	});

	return (
		<main className="min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6">
			{isDragging && <DropOverlay isDraggingPDF={isDraggingPDF} />}
			<div className="mx-auto max-w-4xl">
				<h1 className="text-3xl font-bold mb-4 text-center">PDF統合ツール</h1>
				<Badges />

				<div className="relative z-20 mb-6 flex flex-col gap-6 rounded-lg border border-ctp-overlay0 bg-ctp-base p-6 shadow-light dark:shadow-dark">
					<InfoModal />
					<UploadArea onChange={handleFileInputChange} />
					<FileList
						files={files}
						onRemove={removeFile}
						onReorder={reorderFiles}
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
