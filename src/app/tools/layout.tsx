"use server";

import AuthRequired from "@/components/authRequired";
import { verifySession } from "@/functions/passkey/verifySession";

export default async function ToolsLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await verifySession();

	// biome-ignore lint/complexity/noUselessFragments: これが無いとエラーになる
	return session?.userID ? <>{children}</> : <AuthRequired />;
}
