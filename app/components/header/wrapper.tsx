import ColorModeButton from "./colorModeButton";
import HomeButton from "./homeButton";
import PageButton from "./pageButton";

export default function Header() {
	return (
		<div className="fixed top-0 left-0 w-full flex items-center justify-center">
			<div
				className="
			inline-flex items-center justify-center
			m-2 px-2 py-1 gap-4 rounded-full
			bg-white/60 dark:bg-black/60
			border border-gray-400 dark:border-gray-600
			backdrop-blur-md shadow-light dark:shadow-dark
			"
			>
				<HomeButton />
				<div className="h-4 w-0 border-l border-gray-400 dark:border-gray-600" />
				<PageButton url="/about" display="About" />
				<PageButton url="/tools" display="Tools" />
				<PageButton url="/random" display="Random" />
				<PageButton url="/nothing" display="Nothing" />
				<div className="h-4 w-0 border-l border-gray-400 dark:border-gray-600" />
				<ColorModeButton />
			</div>
		</div>
	);
}
