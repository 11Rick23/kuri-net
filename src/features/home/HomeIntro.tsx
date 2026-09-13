"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useRef } from "react";
import HomeIntroAnimation from "./HomeIntroAnimation";

export default function HomeIntro({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const contentRef = useRef<HTMLDivElement>(null);

	return (
		<>
			<div ref={contentRef}>{children}</div>
			{pathname === "/" && <HomeIntroAnimation contentRef={contentRef} />}
		</>
	);
}
