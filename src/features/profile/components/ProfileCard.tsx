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
import styles from "../Profile.module.css";

export default function ProfileCard() {
	return (
		<section aria-labelledby="profile-heading" className={styles.cover}>
			<div className={styles.identity}>
				<div className={styles.logo}>
					<Image
						src={profileLogo.light}
						alt={profileLogo.alt}
						fill
						sizes="(max-width: 767px) 112px, 224px"
						className="object-contain dark:hidden"
					/>
					<Image
						src={profileLogo.dark}
						alt={profileLogo.alt}
						fill
						sizes="(max-width: 767px) 112px, 224px"
						className="hidden object-contain dark:block"
					/>
				</div>

				<div className={styles.identityText}>
					<h1 id="profile-heading" className={styles.name}>
						kuri-kuri
					</h1>
					<p className={styles.alias}>a.k.a. 11Rick23</p>

					<div className={styles.tags}>
						{profileTags.map((tag) => (
							<span key={tag}>{tag}</span>
						))}
					</div>

					<div className={styles.contacts}>
						<a
							href={profileGitHub.href}
							target="_blank"
							rel="noopener noreferrer"
							className={styles.contactLink}
						>
							<FaGithub aria-hidden="true" />
							<span>{profileGitHub.display}</span>
						</a>
						<a href={profileEmail.href} className={styles.contactLink}>
							<MdEmail aria-hidden="true" />
							<span>{profileEmail.display}</span>
						</a>
					</div>
				</div>
			</div>

			<dl className={styles.details}>
				{profileDetails.map((detail) => {
					const Icon = detail.icon;

					return (
						<div key={detail.label} className={styles.detail}>
							<dt>
								<Icon aria-hidden="true" />
								{detail.label}
							</dt>
							<dd>{detail.value}</dd>
						</div>
					);
				})}
			</dl>
		</section>
	);
}
