import { MdOutlineInfo } from "react-icons/md";
import IconButton from "@/shared/components/button/IconButton";
import { useModal } from "@/shared/components/modal/modalProvider";

function InfoModalContent() {
	return (
		<>
			<h3 className="font-semibold mb-2">使い方</h3>
			<ol className="list-decimal list-inside space-y-2 text-sm">
				<li>PDFファイルを追加</li>
				<li>統合したい順序に並び替える</li>
				<li>「PDFを統合して保存」ボタンをクリック</li>
				<li>統合されたPDFファイルがダウンロードされます！</li>
			</ol>
		</>
	);
}

export default function InfoModal() {
	const { openModal } = useModal();

	return (
		<IconButton
			ariaLabel="使い方を開く"
			onClick={() => openModal(<InfoModalContent />, { paddingSize: 4 })}
			tone="subtle"
			className="absolute top-4 right-4 p-1 text-gray-500"
		>
			<MdOutlineInfo size={24} />
		</IconButton>
	);
}
