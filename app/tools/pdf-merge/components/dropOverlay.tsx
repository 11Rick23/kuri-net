type Props = {
	isDraggingPDF: boolean;
};

export default function DropOverlay({ isDraggingPDF }: Props) {
	return (
		<div
			className={`
        fixed flex items-center justify-center w-screen h-screen
        ${isDraggingPDF ? "bg-blue-600/80" : "bg-red-600/80"}
        `}
		>
			<p className="text-white text-2xl font-bold">
				{isDraggingPDF
					? "PDFファイルをドロップして追加"
					: "PDF以外のファイルは追加できません"}
			</p>
		</div>
	);
}
