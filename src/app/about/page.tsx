import type { Metadata } from "next";
import AboutScreen from "@/features/about/AboutScreen";

export const metadata: Metadata = {
	title: "About",
};

export default function About() {
	return <AboutScreen />;
}
