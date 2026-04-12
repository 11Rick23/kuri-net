import { MdOutlineFileUpload } from "react-icons/md";

type Props = {
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function UploadArea({ onChange }: Props) {
	return (
		<label
			htmlFor="pdf-upload"
			className="
                flex flex-col justify-center items-center
                mx-auto p-4
                w-3/4 h-42 rounded-md
                border border-dashed border-ctp-surface1
                bg-ctp-surface0 text-ctp-subtext1
                hover:bg-ctp-overlay0/50
                hover:cursor-pointer
            "
		>
			<input
				id="pdf-upload"
				type="file"
				accept="application/pdf"
				multiple
				onChange={onChange}
				className="hidden"
			/>
			<MdOutlineFileUpload size={48} className="mb-4" />
			<p className="text-center">
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
