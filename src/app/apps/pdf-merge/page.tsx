import type { Metadata } from "next";
import PdfMergePage from "@/features/tools/pdf-merge/PdfMergePage";
import { getToolDefinitionBySlug } from "@/features/tools/toolDefinitions";

const app = getToolDefinitionBySlug("pdf-merge");

export const metadata: Metadata = {
	title: app?.title ?? "pdf-merge",
};

export default function PdfMerge() {
	return <PdfMergePage />;
}
