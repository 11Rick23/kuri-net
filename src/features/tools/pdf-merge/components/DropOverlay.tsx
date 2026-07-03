type Props = {
	isDraggingPDF: boolean;
};

export default function DropOverlay({ isDraggingPDF }: Props) {
	return (
		<div
			className={`
        fixed inset-0 z-90 flex items-center justify-center px-6
        ${isDraggingPDF ? "bg-ctp-blue/85" : "bg-ctp-red/85"}
        `}
		>
			<p className="max-w-xl text-center text-2xl font-bold leading-9 text-ctp-crust">
				{isDraggingPDF
					? "PDFファイルをドロップして追加"
					: "PDF以外のファイルは追加できません"}
			</p>
		</div>
	);
}
