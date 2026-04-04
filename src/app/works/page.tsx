import type { Metadata } from "next";
import WorksScreen from "@/features/works/WorksScreen";

export const metadata: Metadata = {
	title: "Works",
	description: "kuri-kuriの制作実績と技術的な取り組みをまとめたページ",
};

export default function WorksPage() {
	return <WorksScreen />;
}
