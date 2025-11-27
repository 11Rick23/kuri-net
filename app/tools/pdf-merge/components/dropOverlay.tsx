export default function DropOverlay() {
	return (
		<div
			className="
        fixed flex items-center justify-center w-screen h-screen
        bg-blue-600/80
        "
		>
			<p className="text-white text-2xl font-bold">
				ファイルをドロップしてアップロード
			</p>
		</div>
	);
}
