"use client";

import ToolsPageFrame from "@/features/tools/components/ToolsPageFrame";
import ActionButtons from "@/features/tools/pdf-merge/components/ActionButtons";
import DropOverlay from "@/features/tools/pdf-merge/components/DropOverlay";
import { FileList } from "@/features/tools/pdf-merge/components/FileList";
import InfoModal from "@/features/tools/pdf-merge/components/InfoModal";
import { UploadArea } from "@/features/tools/pdf-merge/components/UploadArea";
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
			description={tool.description}
			badges={tool.badges}
		>
			{isDragging && <DropOverlay isDraggingPDF={isDraggingPDF} />}
			<section
				aria-label="PDF結合ツール"
				className="relative z-20 flex flex-col gap-7 rounded-lg border border-ctp-surface1 bg-ctp-base p-4 sm:p-6"
			>
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
			</section>
		</ToolsPageFrame>
	);
}
