"use client";

import ToolsPageFrame from "@/features/tools/components/ToolsPageFrame";
import ActionButtons from "@/features/tools/pdf-merge/components/actionButtons";
import DropOverlay from "@/features/tools/pdf-merge/components/dropOverlay";
import { FileList } from "@/features/tools/pdf-merge/components/fileList";
import InfoModal from "@/features/tools/pdf-merge/components/infoModal";
import { UploadArea } from "@/features/tools/pdf-merge/components/uploadArea";
import { useGlobalDrag } from "@/features/tools/pdf-merge/hooks/useGlobalDrag";
import { usePdfMerge } from "@/features/tools/pdf-merge/hooks/usePdfMerge";
import { getToolDefinitionBySlug } from "@/features/tools/toolDefinitions";

export default function PdfMergePage() {
	const tool = getToolDefinitionBySlug("pdf-merge");

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

	if (!tool) {
		throw new Error("Tool definition not found: pdf-merge");
	}

	return (
		<ToolsPageFrame
			title={tool.title}
			englishTitle={tool.englishTitle}
			description={tool.description}
			badges={tool.badges}
		>
			{isDragging && <DropOverlay isDraggingPDF={isDraggingPDF} />}
			<div className="relative z-20 flex flex-col gap-6 rounded-2xl border border-ctp-surface1 bg-ctp-base p-6 shadow-light dark:shadow-dark">
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
		</ToolsPageFrame>
	);
}
