import { MdLaptopMac } from "react-icons/md";
import ToolBadge from "@/features/tools/components/ToolBadge";

export default function Badges() {
	return (
		<div className="flex justify-center">
			<ToolBadge
				icon={<MdLaptopMac size={24} />}
				ariaLabel="ローカル動作について表示"
				triggerToneClassName="bg-orange-200 dark:bg-orange-900"
				contentToneClassName="bg-orange-100 dark:bg-orange-900 text-black dark:text-white"
			>
				このツールは端末内で動作し、
				<br />
				ファイルがサーバーへアップロード
				<br className="sm:hidden" />
				されることはありません
			</ToolBadge>
		</div>
	);
}
