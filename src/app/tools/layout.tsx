import ToolsShell from "@/features/tools/components/ToolsShell";

export default async function ToolsLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <ToolsShell>{children}</ToolsShell>;
}
