import { MdOutlineFileUpload } from "react-icons/md";

type Props = {
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function UploadArea({ onChange }: Props) {
	return (
		<label
			htmlFor="pdf-upload"
			className="
                mx-auto flex min-h-44 w-full max-w-3xl cursor-pointer
                flex-col items-center justify-center rounded-lg
                border border-dashed border-ctp-surface1
                bg-ctp-mantle px-5 py-8 text-ctp-subtext1
                transition duration-200
                hover:border-ctp-blue/45 hover:bg-ctp-surface0
                focus-within:border-ctp-blue focus-within:ring-2
                focus-within:ring-ctp-blue/30
            "
		>
			<input
				id="pdf-upload"
				type="file"
				accept="application/pdf"
				multiple
				onChange={onChange}
				className="sr-only"
			/>
			<span className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-ctp-surface1 bg-ctp-base text-ctp-blue">
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
