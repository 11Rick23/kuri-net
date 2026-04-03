"use client";

import { logout } from "@/features/auth/server/logout";
import { useToast } from "@/shared/components/toast/toastProvider";

export default function useLogoutHandler() {
	const { toast } = useToast();

	async function onLogoutButtonPress() {
		try {
			await logout();
			toast("ログアウトしました。", {
				type: "success",
				durationMs: 10000,
				id: "logout-success",
			});
		} catch (error) {
			console.log("ログアウト中にエラーが発生しました");
			console.log(error);
		}
	}
	return { onLogoutButtonPress };
}
