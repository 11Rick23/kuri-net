import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import signUp from "@/app/functions/passkey/signup";

export default function SignUpModalContent() {
	const [agreed, setAgreed] = useState(false);
	const [username, setUsername] = useState("");

	return (
		<>
			<header className="text-center space-y-2">
				<h1 className="text-3xl font-bold">アカウント登録</h1>
			</header>

			<div className="flex flex-col items-center text-center">
				<p
					className="
				text-sm my-4 p-4 rounded-md
				bg-yellow-400/20 dark:bg-yellow-700/20
				border-2 border-yellow-400 dark:border-yellow-700"
				>
					本サービスではパスキーによる認証のみを提供しております。
					<br />
					アカウント登録には対応したデバイスとブラウザが必要です。
					<br /> <br />
					本サービスは個人の趣味で開発・運営されており、
					<br />
					本サービス上で発生したいかなる損害や不都合に対し
					<br />
					いかなる責任も負いかねますのでご了承ください。
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
						peer-checked:bg-blue-500
						peer-checked:border-blue-500"
					>
						{agreed && <FaCheck className="text-white text-[10px]" />}
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
						border rounded-md text-center
						font-bold placeholder:font-medium
						placeholder:text-xs
						bg-white dark:bg-black
						"
				/>

				<button
					type="button"
					disabled={!agreed}
					onClick={async () => {
						await signUp(username);
					}}
					className={`
					rounded-md
					px-5 py-2 font-medium
					${
						agreed
							? "bg-black dark:bg-white text-white dark:text-black hover:opacity-75 cursor-pointer"
							: "bg-black/30 dark:bg-white/30 text-gray-200 dark:text-black cursor-not-allowed"
					}`}
				>
					登録
				</button>
			</div>
		</>
	);
}
