"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import register from "@/features/auth/client/registration";
import { validateDisplayName } from "@/features/auth/shared/displayName";
import { useModal } from "@/shared/components/modal/ModalProvider";

export default function RegistrationModalContent() {
	const [agreed, setAgreed] = useState(false);
	const [displayName, setDisplayName] = useState("");
	const [isRegistering, setIsRegistering] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const { closeModal } = useModal();
	const router = useRouter();
	const displayNameIsValid = validateDisplayName(displayName).ok;

	async function onRegisterButtonPress() {
		setErrorMessage("");
		setIsRegistering(true);

		try {
			const result = await register(displayName);

			if (result.ok) {
				closeModal();
				router.refresh();
			} else {
				setErrorMessage(result.error);
			}
		} catch {
			setErrorMessage(
				"アカウント登録に失敗しました。しばらくしてから再度お試しください。",
			);
		} finally {
			setIsRegistering(false);
		}
	}

	return (
		<>
			<header className="text-center space-y-2">
				<h1 className="text-3xl font-bold">アカウント登録</h1>
			</header>

			<div className="flex flex-col items-center text-center">
				<p
					className="
                text-sm my-4 p-4 rounded-md
                bg-app-warning/15 text-ctp-subtext1
                border-2 border-app-warning"
				>
					本サービスではパスキーによる認証のみを提供しております。
					<br />
					ご利用には対応したデバイスとブラウザが必要となります。
					<br /> <br />
					本サービスは個人の趣味として開発・運営しています。
					<br />
					サービスの利用によって生じた損害や不利益について、
					<br />
					当方は一切の責任を負いかねますので、ご了承ください。
				</p>

				<label className="flex items-center gap-2 text-sm cursor-pointer select-none">
					<input
						type="checkbox"
						className="peer sr-only"
						checked={agreed}
						onChange={(e) => setAgreed(e.target.checked)}
					/>
					<span
						className="
                        flex items-center justify-center
                        w-4 h-4 rounded-sm border
                        border-ctp-overlay0
                        peer-checked:bg-ctp-blue
						peer-checked:border-ctp-blue
						peer-focus-visible:ring-2
						peer-focus-visible:ring-app-accent
						peer-focus-visible:ring-offset-2
						peer-focus-visible:ring-offset-ctp-surface0"
					>
						{agreed && <FaCheck className="text-[10px] text-ctp-crust" />}
					</span>
					<span>上記注意事項を読み、同意します</span>
				</label>

				<label htmlFor="display-name" className="mt-7 text-sm font-medium">
					表示名
				</label>
				<input
					id="display-name"
					type="text"
					value={displayName}
					onChange={(e) => setDisplayName(e.target.value)}
					placeholder="表示名を入力"
					maxLength={200}
					className="
							w-full max-w-72 mt-2 mb-7 px-3 py-2
                        border border-ctp-overlay0 rounded-md text-center
                        font-bold placeholder:font-medium
                        placeholder:text-xs placeholder:text-ctp-text/80
                        bg-ctp-base"
				/>

				<button
					type="button"
					disabled={!agreed || !displayNameIsValid || isRegistering}
					onClick={async () => {
						await onRegisterButtonPress();
					}}
					className={`
                        rounded-md
                        px-5 py-2 font-medium
						${
							agreed && displayNameIsValid && !isRegistering
								? "cursor-pointer bg-ctp-blue text-ctp-crust hover:opacity-90"
								: "cursor-not-allowed bg-ctp-surface1 text-ctp-text/50"
						}`}
				>
					{isRegistering ? "登録中…" : "登録"}
				</button>

				{errorMessage && (
					<p
						className="
                        text-sm mt-4
                        font-semibold
                        text-ctp-red"
						role="alert"
					>
						{errorMessage}
					</p>
				)}
			</div>
		</>
	);
}
