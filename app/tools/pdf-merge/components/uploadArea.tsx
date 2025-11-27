import { MdOutlineFileUpload } from "react-icons/md";

type Props = {
	isDragging: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function UploadArea({ isDragging, onChange }: Props) {
	return (
		<label
			htmlFor="pdf-upload"
			className="
                flex flex-col justify-center items-center
				mx-auto p-4
                w-3/4 h-32 rounded-md
                bg-gray-200 dark:bg-gray-700
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
			<MdOutlineFileUpload size={48} />
			<p>
				{isDragging
					? "ファイルをドロップ"
					: "ファイルをドラッグ＆ドロップするか、クリックして選択してください"}
			</p>
		</label>
	);
}