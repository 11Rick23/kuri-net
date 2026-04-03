import type { Metadata } from "next";
import HomeScreen from "@/features/home/HomeScreen";

export const metadata: Metadata = {
	title: "ホームページ",
};

export default function Home() {
	return <HomeScreen />;
}
