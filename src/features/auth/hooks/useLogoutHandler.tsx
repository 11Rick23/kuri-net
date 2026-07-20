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
		} catch (error) {
			console.log("ログアウト中にエラーが発生しました");
			console.log(error);
		}
	}
	return { onLogoutButtonPress };
}
