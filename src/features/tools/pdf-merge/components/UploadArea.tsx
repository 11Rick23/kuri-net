import { MdOutlineFileUpload } from "react-icons/md";

type Props = {
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
};

export function UploadArea({ onChange, disabled = false }: Props) {
	return (
		<label
			htmlFor="pdf-upload"
			aria-disabled={disabled}
			className={`
				flex min-h-60 w-full
				flex-col items-center justify-center rounded-md
				border border-dashed border-ctp-overlay0
				bg-ctp-mantle px-5 py-8 text-ctp-subtext1
				transition duration-200
				focus-within:border-ctp-blue focus-within:ring-2
				focus-within:ring-ctp-blue/30
				${
					disabled
						? "cursor-not-allowed opacity-60"
						: "cursor-pointer hover:border-ctp-blue/45 hover:bg-ctp-surface0"
				}
			`}
		>
			<input
				id="pdf-upload"
				type="file"
				accept="application/pdf"
				multiple
				disabled={disabled}
				onChange={onChange}
				className="sr-only"
			/>
			<span className="mb-4 flex h-14 w-14 items-center justify-center text-ctp-text">
				<MdOutlineFileUpload size={34} aria-hidden />
			</span>
			<p className="text-center text-sm font-semibold leading-7 text-ctp-text sm:text-base">
				<span className="block sm:hidden">タップしてPDFを選択</span>
				<span className="hidden sm:block">
					PDFをドラッグ＆ドロップするか、
					<br />
					クリックして選択してください
				</span>
			</p>
		</label>
	);
}
