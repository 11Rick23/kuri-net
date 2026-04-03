type Props = {
	isDraggingPDF: boolean;
};

export default function DropOverlay({ isDraggingPDF }: Props) {
	return (
		<div
			className={`
        fixed flex items-center justify-center w-screen h-screen z-100
        ${isDraggingPDF ? "bg-ctp-blue/85" : "bg-ctp-red/85"}
        `}
		>
			<p className="text-2xl font-bold text-ctp-crust">
				{isDraggingPDF
					? "PDFファイルをドロップして追加"
					: "PDF以外のファイルは追加できません"}
			</p>
		</div>
	);
}
