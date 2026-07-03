import { MdOutlineInfo } from "react-icons/md";
import IconButton from "@/shared/components/button/IconButton";
import { useModal } from "@/shared/components/modal/ModalProvider";

function InfoModalContent() {
	return (
		<>
			<h3 className="mb-2 font-semibold text-ctp-text">使い方</h3>
			<ol className="list-inside list-decimal space-y-2 text-sm leading-6 text-ctp-subtext1">
				<li>PDFファイルを追加</li>
				<li>統合したい順序に並び替える</li>
				<li>「PDFを統合して保存」ボタンをクリック</li>
				<li>統合されたPDFファイルがダウンロードされます</li>
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
			size="md"
			tone="subtle"
			className="absolute top-2 right-2 p-1"
		>
			<MdOutlineInfo size={24} />
		</IconButton>
	);
}
