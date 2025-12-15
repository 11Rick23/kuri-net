import { useState } from "react";
import { MdLaptopMac } from "react-icons/md";

export default function Badges() {
	const [open, setOpen] = useState(false);

	return (
		<div className="relative text-center">
			<MdLaptopMac
				size={36}
				className="inline-block rounded-full bg-orange-200 dark:bg-orange-900 p-2 mb-4 hover:cursor-help"
				onMouseEnter={() => setOpen(true)}
				onMouseLeave={() => setOpen(false)}
				onClick={() => setOpen(!open)}
			/>
			{open && (
				<div
					className="
                    absolute left-1/2 -translate-x-1/2 top-full -mt-2
                    px-3 py-2 rounded-md
                    bg-orange-100 dark:bg-orange-900
                    text-black dark:text-white text-sm
                    whitespace-nowrap shadow-sm z-50
                    "
				>
					このツールは端末内で動作し、
					<br />
					ファイルがサーバーへアップロード
					<br className="sm:hidden" />
					されることはありません
				</div>
			)}
		</div>
	);
}
