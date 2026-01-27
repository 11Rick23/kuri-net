"use client";

import { useToast } from "@/components/toast/toastProvider";
import { logout } from "@/functions/passkey/logoutServerFunctions";

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
