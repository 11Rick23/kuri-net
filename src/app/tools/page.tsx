import type { Metadata } from "next";
import ToolsIndexScreen from "@/features/tools/ToolsIndexScreen";

export const metadata: Metadata = {
	title: "ツール",
};

export default function ToolsPage() {
	return <ToolsIndexScreen />;
}
