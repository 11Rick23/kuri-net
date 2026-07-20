import ToolsShell from "@/features/tools/components/ToolsShell";

export default function AppsLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <ToolsShell>{children}</ToolsShell>;
}
