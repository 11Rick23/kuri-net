import Image from "next/image";
import { FaGithub } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import {
	profileDetails,
	profileEmail,
	profileGitHub,
	profileLogo,
	profileTags,
} from "@/features/profile/data/profileData";

export default function ProfileCard() {
	return (
		<section
			aria-labelledby="profile-heading"
			className="mx-auto w-full max-w-xl scroll-mt-24"
		>
			<div className="rounded-lg border border-ctp-surface1 bg-ctp-base p-5 sm:p-6">
				<div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-stretch">
					<div className="grid min-w-0 gap-4 sm:grid-rows-[42%_27%_31%]">
						<div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
							<div className="relative aspect-square h-20 shrink-0 sm:h-24">
								<Image
									src={profileLogo.light}
									alt={profileLogo.alt}
									fill
									sizes="(max-width: 1024px) 5rem, 6rem"
									className="rounded-lg object-contain dark:hidden"
								/>
								<Image
									src={profileLogo.dark}
									alt={profileLogo.alt}
									fill
									sizes="(max-width: 1024px) 5rem, 6rem"
									className="hidden rounded-lg object-contain dark:block"
								/>
							</div>

							<div className="min-w-0">
								<h1
									id="profile-heading"
									className="text-3xl font-bold tracking-tight text-ctp-text sm:text-4xl"
								>
									kuri-kuri
								</h1>
								<p className="mt-1 text-base font-semibold text-ctp-subtext1 sm:text-lg">
									a.k.a. 11Rick23
								</p>
							</div>
						</div>

						<div className="mx-auto flex max-w-xs flex-wrap content-center items-center justify-center gap-2 sm:mx-0 sm:max-w-sm sm:justify-start">
							{profileTags.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-ctp-surface1 bg-ctp-mantle px-3 py-1 text-xs font-semibold text-ctp-subtext0"
								>
									{tag}
								</span>
							))}
						</div>

						<div className="flex flex-wrap justify-center gap-2.5 sm:items-start sm:justify-start">
							<a
								href={profileGitHub.href}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex min-w-0 items-center justify-center gap-2 rounded-md border border-ctp-surface1 bg-ctp-mantle px-3 py-2 text-sm font-semibold text-ctp-text transition hover:border-ctp-blue/50 hover:bg-ctp-surface0"
							>
								<FaGithub className="h-5 w-5 shrink-0 text-ctp-blue" />
								<span className="truncate">{profileGitHub.display}</span>
							</a>
							<a
								href={profileEmail.href}
								className="inline-flex min-w-0 items-center justify-center gap-2 rounded-md border border-ctp-surface1 bg-ctp-mantle px-3 py-2 text-sm font-semibold text-ctp-text transition hover:border-ctp-blue/50 hover:bg-ctp-surface0"
							>
								<MdEmail className="h-5 w-5 shrink-0 text-ctp-blue" />
								<span className="truncate">{profileEmail.display}</span>
							</a>
						</div>
					</div>

					<dl className="grid divide-y divide-ctp-surface1 border-y border-ctp-surface1 sm:flex sm:h-full sm:flex-col">
						{profileDetails.map((detail) => {
							const Icon = detail.icon;

							return (
								<div
									key={detail.label}
									className="flex items-center gap-3 px-0 py-3 sm:basis-1/3"
								>
									<Icon className="h-6 w-6 shrink-0 text-ctp-blue" />
									<div className="min-w-0">
										<dt className="text-sm font-semibold text-ctp-subtext0">
											{detail.label}
										</dt>
										<dd className="mt-1 whitespace-normal text-base font-medium leading-7 text-ctp-text sm:whitespace-pre-line">
											{detail.value}
										</dd>
									</div>
								</div>
							);
						})}
					</dl>
				</div>
			</div>
		</section>
	);
}
