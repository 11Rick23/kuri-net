import type { ReactNode } from "react";
import type {
	RichTextContent,
	RichTextLink,
	Topic,
} from "@/features/profile/data/profileContent";

export function ProfileSection({
	label,
	title,
	description,
	children,
}: {
	label: string;
	title: string;
	description?: ReactNode;
	children: ReactNode;
}) {
	return (
		<section className="scroll-mt-24 space-y-5">
			<div className="space-y-3 px-1">
				<p className="text-xs font-semibold uppercase tracking-[0.28em] text-ctp-subtext0">
					{label}
				</p>
				<h2 className="text-2xl font-bold tracking-tight text-ctp-text sm:text-3xl">
					{title}
				</h2>
				{description && (
					<div className="max-w-3xl text-sm leading-7 text-ctp-subtext1 sm:text-base">
						{description}
					</div>
				)}
			</div>
			{children}
		</section>
	);
}

export function TextCard({ children }: { children: ReactNode }) {
	return (
		<div className="rounded-lg border border-ctp-surface1 bg-ctp-base p-5 text-sm leading-7 text-ctp-subtext1 sm:p-6 sm:text-base">
			{children}
		</div>
	);
}

export function RichText({ content }: { content: RichTextContent }) {
	if (typeof content === "string") {
		return content;
	}

	return content.map((part) => {
		if (typeof part === "string") {
			return part;
		}

		return <InlineLink key={`${part.href}-${part.text}`} link={part} />;
	});
}

function InlineLink({ link }: { link: RichTextLink }) {
	const isExternal = /^https?:\/\//.test(link.href);

	return (
		<a
			href={link.href}
			target={isExternal ? "_blank" : undefined}
			rel={isExternal ? "noreferrer" : undefined}
			className="font-semibold text-ctp-blue underline decoration-ctp-blue/40 underline-offset-4 transition hover:text-ctp-sapphire hover:decoration-ctp-sapphire"
		>
			{link.text}
		</a>
	);
}

export function TopicGrid({ topics }: { topics: Topic[] }) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			{topics.map((topic) => (
				<article
					key={topic.title}
					className="rounded-lg border border-ctp-surface1 bg-ctp-base p-5 sm:p-6"
				>
					<h3 className="text-xl font-semibold tracking-tight text-ctp-text">
						{topic.title}
					</h3>
					<p className="mt-3 text-sm leading-7 text-ctp-subtext1">
						<RichText content={topic.body} />
					</p>
				</article>
			))}
		</div>
	);
}
