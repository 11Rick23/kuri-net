"use client";

import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import register from "@/features/auth/client/registration";
import { useModal } from "@/shared/components/modal/modalProvider";

export default function RegistrationModalContent() {
	const [agreed, setAgreed] = useState(false);
	const [username, setUsername] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const { closeModal } = useModal();

	async function onRegisterButtonPress() {
		setErrorMessage("");

		const res = await register(username);

		if (res.ok) {
			closeModal();
		} else {
			setErrorMessage(res.error);
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
                        peer-checked:border-ctp-blue-300"
					>
						{agreed && <FaCheck className="text-[10px] text-ctp-crust" />}
					</span>
					<span>上記注意事項を読み、同意します</span>
				</label>

				<input
					id="username"
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="パスキーの名称"
					className="
                        w-full max-w-50 my-7 px-3 py-2
                        border border-ctp-overlay0 rounded-md text-center
                        font-bold placeholder:font-medium
                        placeholder:text-xs placeholder:text-ctp-text/80
                        bg-ctp-base"
				/>

				<button
					type="button"
					disabled={!agreed}
					onClick={async () => {
						await onRegisterButtonPress();
					}}
					className={`
                        rounded-md
                        px-5 py-2 font-medium
						${
							agreed
								? "cursor-pointer bg-ctp-blue text-ctp-crust hover:opacity-90"
								: "cursor-not-allowed bg-ctp-surface1 text-ctp-text/50"
						}`}
				>
					登録
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
