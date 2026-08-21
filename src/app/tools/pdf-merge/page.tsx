import type { Metadata } from "next";
import PdfMergePage from "@/features/tools/pdf-merge/PdfMergePage";
import { getToolDefinitionBySlug } from "@/features/tools/toolDefinitions";

const tool = getToolDefinitionBySlug("pdf-merge");

export const metadata: Metadata = {
	title: tool?.title ?? "pdf-merge",
};

export default function PdfMerge() {
	return <PdfMergePage />;
}
