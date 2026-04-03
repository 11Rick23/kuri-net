import { MdLaptopMac } from "react-icons/md";
import ToolBadge from "@/features/tools/components/ToolBadge";

export default function Badges() {
	return (
		<div className="flex justify-center">
			<ToolBadge
				icon={<MdLaptopMac size={24} />}
				ariaLabel="ローカル動作について表示"
				triggerToneClassName="bg-ctp-peach/20 text-ctp-peach ring-1 ring-ctp-peach/40"
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
