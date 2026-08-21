import type { Metadata } from "next";
import ToolsIndexScreen from "@/features/tools/ToolsIndexScreen";

export const metadata: Metadata = {
	title: "Apps",
};

export default function AppsPage() {
	return <ToolsIndexScreen />;
}
