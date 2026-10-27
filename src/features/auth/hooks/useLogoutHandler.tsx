"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/features/auth/client/authClient";
import { useToast } from "@/shared/components/toast/ToastProvider";

export default function useLogoutHandler() {
	const { toast } = useToast();
	const router = useRouter();

	async function onLogoutButtonPress() {
		try {
			const result = await authClient.signOut();
			if (result.error) {
				throw new Error(result.error.message);
			}
			toast("ログアウトしました。", {
				type: "success",
				durationMs: 10000,
				id: "logout-success",
			});
			router.push("/");
			router.refresh();
		} catch {
			toast("ログアウトに失敗しました。しばらくしてから再度お試しください。", {
				type: "error",
				durationMs: 5000,
				id: "logout-error",
			});
		}
	}
	return { onLogoutButtonPress };
}
