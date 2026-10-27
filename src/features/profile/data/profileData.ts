export const profileLogo = {
	light: "/profile/logo-skelton-white.png",
	dark: "/profile/logo-skelton-dark.png",
	alt: "kuri-kuri logo",
};

export const profileGitHub = {
	href: "https://github.com/11Rick23",
	display: "github.com/11Rick23",
};

export const profileEmail = {
	href: "mailto:contact@kuri-kuri.net",
	display: "contact@kuri-kuri.net",
};

export const profileIdentity = {
	handle: "kuri-kuri",
	alias: "11Rick23",
	affiliation: "慶應義塾大学 環境情報学部",
};

export const profileGreeting = {
	before: "初めまして、",
	after: "と申します。",
};

export type ProfileEquipmentIcon =
	| "desktop"
	| "laptop"
	| "phone"
	| "watch"
	| "earbuds"
	| "headset"
	| "gamepad"
	| "browser"
	| "mail"
	| "tasks"
	| "launcher"
	| "code"
	| "chat"
	| "terminal"
	| "lock"
	| "shield";

export type ProfileDevice = {
	id: string;
	name: string;
	icon: ProfileEquipmentIcon;
	group: "computers" | "mobile" | "audio" | "gaming";
	details?: { label: string; value: string }[];
};

export const profileDevices: ProfileDevice[] = [
	{
		id: "mac-studio",
		name: "Mac Studio",
		icon: "desktop",
		group: "computers",
		details: [
			{ label: "チップ", value: "Apple M1 Max" },
			{ label: "メモリ", value: "32GB ユニファイドメモリ" },
		],
	},
	{
		id: "macbook-air",
		name: "MacBook Air",
		icon: "laptop",
		group: "computers",
		details: [
			{ label: "チップ", value: "Apple M2" },
			{ label: "メモリ", value: "16GB ユニファイドメモリ" },
			{ label: "ディスプレイ", value: "13.6インチ Liquid Retina" },
		],
	},
	{
		id: "windows-pc",
		name: "自作Windows PC",
		icon: "desktop",
		group: "computers",
		details: [
			{ label: "CPU", value: "AMD Ryzen 7 5700X（8コア / 16スレッド）" },
			{ label: "GPU", value: "NVIDIA GeForce RTX 4060 Ti" },
			{ label: "メモリ", value: "32GB" },
		],
	},
	{
		id: "iphone",
		name: "iPhone 15 Pro",
		icon: "phone",
		group: "mobile",
		details: [
			{ label: "チップ", value: "A17 Pro" },
			{ label: "ディスプレイ", value: "6.1インチ Super Retina XDR" },
		],
	},
	{
		id: "apple-watch",
		name: "Apple Watch Ultra 3",
		icon: "watch",
		group: "mobile",
		details: [
			{ label: "ケース", value: "49mm チタニウム" },
			{ label: "チップ", value: "S10" },
		],
	},
	{
		id: "sony-earbuds",
		name: "Sony WF-1000XM6",
		icon: "earbuds",
		group: "audio",
		details: [
			{ label: "タイプ", value: "完全ワイヤレスイヤホン" },
			{ label: "機能", value: "ノイズキャンセリング" },
		],
	},
	{
		id: "astro-a50",
		name: "ASTRO A50",
		icon: "headset",
		group: "audio",
		details: [
			{ label: "ブランド", value: "Logicool G / ASTRO" },
			{ label: "タイプ", value: "ワイヤレスゲーミングヘッドセット" },
		],
	},
	{
		id: "nintendo-switch",
		name: "Nintendo Switch",
		icon: "gamepad",
		group: "gaming",
		details: [
			{ label: "シリーズ", value: "Nintendo Switch（初代）" },
			{ label: "プレイモード", value: "TV・テーブル・携帯モード" },
		],
	},
];

export type ProfileApplication = {
	id: string;
	name: string;
	href: string;
	icon: ProfileEquipmentIcon;
	group: "everyday" | "development" | "security";
};

export const profileApplications: ProfileApplication[] = [
	{
		id: "phi",
		name: "Phi Browser",
		href: "https://phibrowser.com/",
		icon: "browser",
		group: "everyday",
	},
	{
		id: "spark",
		name: "Spark Mail",
		href: "https://sparkmailapp.com/",
		icon: "mail",
		group: "everyday",
	},
	{
		id: "todoist",
		name: "Todoist",
		href: "https://www.todoist.com/",
		icon: "tasks",
		group: "everyday",
	},
	{
		id: "tinycast",
		name: "Tinycast",
		href: "https://tinycast.dev/",
		icon: "launcher",
		group: "everyday",
	},
	{
		id: "vscode",
		name: "Visual Studio Code",
		href: "https://code.visualstudio.com/",
		icon: "code",
		group: "development",
	},
	{
		id: "chatgpt",
		name: "ChatGPT",
		href: "https://chatgpt.com/",
		icon: "chat",
		group: "development",
	},
	{
		id: "codex",
		name: "Codex",
		href: "https://openai.com/codex/",
		icon: "terminal",
		group: "development",
	},
	{
		id: "1password",
		name: "1Password",
		href: "https://1password.com/",
		icon: "lock",
		group: "security",
	},
	{
		id: "adguard",
		name: "AdGuard",
		href: "https://adguard.com/",
		icon: "shield",
		group: "security",
	},
];

export type ProfileTextPart = string | { text: string; href: string };

export type ProfileTimelineEvent = {
	id: string;
	date: string;
	title: string;
	detail: ProfileTextPart[][];
};

export type ProfileTimelineDate = {
	year: number;
	month?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
};

export type ProfileTimelinePeriod = {
	id: string;
	age: number;
	start: ProfileTimelineDate;
	end: ProfileTimelineDate | "Current";
	events: ProfileTimelineEvent[];
};

const link = (text: string, href: string) => ({ text, href });

export const profileTimeline: ProfileTimelinePeriod[] = [
	{
		id: "childhood",
		age: 0,
		start: { year: 2005, month: 11 },
		end: { year: 2016, month: 8 },
		events: [
			{
				id: "birth",
				date: "2005年11月23日",
				title: "出生",
				detail: [
					["2005年の11月23日、勤労感謝の日に生まれました。"],
					[
						"両親が仕事の都合でスペインへ赴任していたことにより、場所はスペインのマドリードです。",
						"1歳になる前に帰国し、幼少期は日本で過ごしたため、スペインで生活した記憶はありません。",
					],
				],
			},
			{
				id: "nickname",
				date: "小学生時代",
				title: "「kuri-kuri」について",
				detail: [
					[
						"小学生の頃、友達から「くりっくりー」というあだ名で呼ばれたことをきっかけに、ゲームなどのユーザー名では「くりっくりー」というニックネームを使っています。",
						"kuri-kuriというハンドルネームはそれが由来です。",
					],
					[
						"他にも、「くり」「kuri」「11Rick23」といったユーザー名を使用することがあります。",
					],
				],
			},
		],
	},
	{
		id: "korea",
		age: 10,
		start: { year: 2016, month: 8 },
		end: { year: 2019, month: 8 },
		events: [
			{
				id: "school-in-korea",
				date: "2016年8月",
				title: "韓国のインターナショナルスクールへ",
				detail: [
					[
						"小学5年生だった2016年8月に、父の仕事の都合で韓国へ移住しました。2019年8月まで、インターナショナルスクール「",
						link("Dwight School Seoul", "https://dwight.or.kr/"),
						"」に通っていました。",
					],
				],
			},
			{
				id: "first-computer",
				date: "韓国在住中",
				title: "初めてのMacBookとデジタル制作",
				detail: [
					[
						"韓国の学校では授業用にMacBookが必要で、両親に買ってもらいました。初めての自分のデジタル機器でした。",
					],
					[
						"設定を変えたり、便利なアプリを探して試したりするうちに、コンピューターでできることを知るのが楽しくなりました。",
					],
					[
						"韓国の学校では、レポートや発表資料の作成に加え、音楽・映像・デジタルアート・3Dモデルの制作・入門的なプログラミングなど、多種多様な技術を体験しました",
					],
				],
			},
		],
	},
	{
		id: "usa",
		age: 13,
		start: { year: 2019, month: 8 },
		end: { year: 2020, month: 12 },
		events: [
			{
				id: "school-in-usa",
				date: "2019年8月",
				title: "米国の現地校へ",
				detail: [
					[
						"2019年8月に米国へ移り、メリーランド州の公立中学校 ",
						link(
							"Thomas W. Pyle Middle School",
							"https://www.montgomeryschoolsmd.org/schools/pylems/",
						),
						" に約1年、公立高校 ",
						link(
							"Walt Whitman High School",
							"https://www.montgomeryschoolsmd.org/schools/whitmanhs/",
						),
						" に約半年通いました。",
					],
					[
						"途中からコロナ禍で授業がオンラインになり、米国生活の後半は日本の高校を受験するための勉強に力を入れました。",
					],
					[
						"海外でさまざまな文化や価値観に触れた経験は、アイデアを出したり、問題を別の角度から捉えたりするときに役立っています。",
					],
					[
						"自分と異なる考え方を受け止めることは、新しい環境に適応したり、慣れない問題に柔軟に対応したりする力にもつながったと感じています。",
					],
				],
			},
			{
				id: "return-to-japan",
				date: "2020年12月",
				title: "高校受験のため、日本へ帰国",
				detail: [
					[
						"コロナ禍で受験も影響を受ける中、2020年の12月に日本へ帰国し、高校受験を行いました。",
					],
					[
						"帰国受験における様々な都合により、帰国後2ヶ月程度、日本の公立中学校へ通いました。",
					],
				],
			},
		],
	},
	{
		id: "high-school",
		age: 15,
		start: { year: 2021, month: 4 },
		end: { year: 2024, month: 3 },
		events: [
			{
				id: "high-school-start",
				date: "2021年4月",
				title: "塾高へ進学",
				detail: [
					[
						"帰国子女受験で",
						link("慶應義塾高等学校", "https://www.hs.keio.ac.jp/"),
						"へ入学しました。",
					],
					["高校では文化祭の実行委員会やスキー部に所属しました。"],
					[
						"スキー部では、回転・大回転などのアルペンスキーに取り組みました。",
						"毎年県大会に出場し、高校2・3年次には関東大会へ進出しました。",
					],
				],
			},
			{
				id: "first-development",
				date: "高校時代",
				title: "Pythonでアプリ開発",
				detail: [
					["高校時代に趣味としてプログラミングを始めました。"],
					[
						"初めて作ったのは、チャット・通話サービスの",
						link("Discord", "https://discord.com/"),
						"上で動くアプリ（通称BOT）です。",
						"詳しくは",
						link("Works", "/works"),
						"ページにて、「小惑星」として紹介しています。",
					],
					[
						"とあるDiscordコミュニティの運営・管理に携わるうちに、既存のBOTに不便さを感じ、自作を始めました。",
						"現在も開発・運用を続けています。",
					],
				],
			},
			{
				id: "school-festival",
				date: "高校3年次",
				title: "日吉際実行委員会",
				detail: [
					[
						"3年次に、所属していた塾校の文化祭実行委員会「日吉祭実行委員会」の副委員長を担当しました。",
					],
					["詳しくは、", link("Works", "/works"), "ページの"],
					[
						"私は日吉祭の副委員長として、実行委員会の内部を取りまとめました。",
						"さらに、ブース企画者や外部業者との連絡・対応、学校事務との協議・交渉も担当しました。",
					],
					[
						"当時の日吉祭では、生徒が実現したい企画と、学校が求める感染症対策の両立が課題でした。",
						"それに加え、野球部の甲子園優勝によって多くの来場者が訪れる可能性もあり、入場制限や警備の方法を検討する必要がありました。",
					],
					[
						"私たちは、生徒の企画をできる限り実現しながら、安全面を重視する学校側にも納得してもらえるよう、関係者の間で調整を重ねました。",
					],
					[
						"さらに、一般の来場者を受け入れる範囲、飲食の制限、企画にかかる費用と売上の扱い、警備の費用などについて、実行委員会と学校事務で協議を重ねました。",
					],
					[
						"生徒の要望をできる限り取り入れながら学校の許可を得られるルールを実行委員会で決め、大きな不満や問題なく文化祭を終えることができました。",
						"文化祭という大規模なプロジェクトを成功させるために、委員会のまとめ役として仕事をした経験はとても貴重だったと感じています。",
					],
					[
						"その年、私が担当して作成したパンフレットを",
						link("Works", "/works"),
						"ページにて公開しています。",
					],
				],
			},
		],
	},
	{
		id: "university",
		age: 18,
		start: { year: 2024, month: 4 },
		end: "Current",
		events: [
			{
				id: "university-start",
				date: "2024年4月",
				title: "環境情報学部へ進学",
				detail: [
					[
						"高校時代に趣味としてプログラミングを始めたことがきっかけで、情報技術に関心を持ちました。",
						"情報技術を学びたいという思いから、慶應義塾大学の",
						link("環境情報学部", "https://www.keio.ac.jp/ja/sfc-pem/pmei/"),
						"へ進学しました。",
					],
					[
						"大学では、インターネットの仕組み、ソフトウェアの設計、アルゴリズム、セキュリティ、電子回路など、IT技術全般について幅広く学んでいます。",
					],
					["このサイトも、学んだことを実践的に活用する取り組みの一つです。"],
					[
						"大学では「リーゼンスキークラブ」というサークルに所属し、高校で始めた競技スキーを趣味として続けています。",
					],
				],
			},
			{
				id: "research",
				date: "大学在学中 - Current",
				title: "ユーザビリティへの関心",
				detail: [
					[
						link("SFC-RG合同研究室", "https://rg.sfc.keio.ac.jp/ja/"),
						"の",
						link("Delightグループ", "https://delight.sfc.wide.ad.jp/ja/"),
						"に所属しています。",
					],
					[
						"本研究グループでは、複数のコンピューターを活用する「分散システム」や、デジタル空間上において利用者を識別する「デジタルアイデンティティ」がメインの研究テーマです。",
					],
					[
						"私はデジタルアイデンティティや認証認可に関心があり、大学2年次に本研究室へ所属しました。",
					],
					[
						"しかし、セキュリティとユーザビリティを両立させた認証手段である「パスキー」について学んだことをきっかけに、「ユーザビリティ」に強い関心を持つようになりました",
						"現在はユーザビリティやUI・UX、セキュリティなどの学習を続けながら、卒業論文に向けたテーマ探しを行なっています。",
					],
				],
			},
		],
	},
];
