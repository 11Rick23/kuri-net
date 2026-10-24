export type ProfileTextPart = string | { text: string; href: string };
export type ProfileInlinePart = ProfileTextPart | { text: string; note: true };

export type ProfilePassage = {
	id: string;
	title: string;
	summary: ProfileInlinePart[];
	preview: string;
	detail: ProfileTextPart[][];
};

type StoryChapter = { id: string; paragraphs: ProfilePassage[][] };
const word = (text: string): { text: string; note: true } => ({
	text,
	note: true,
});
const link = (text: string, href: string) => ({ text, href });

export function createProfileStory(age: number): StoryChapter[] {
	const passages = {
		nickname: {
			id: "nickname",
			title: "ハンドルネームの由来",
			summary: ["初めまして、", word("kuri-kuri"), "と申します。"],
			preview: "あだ名「くりっくりー」が由来です。",
			detail: [
				[
					"kuri-kuriというハンドルネームは、幼い頃に友達から「くりっくりー」と呼ばれたことに由来します。ゲームなどのユーザー名では、「くりっくりー」「くり」「kuri」「11Rick23」といった名前を使用しています。",
				],
			],
		},
		birth: {
			id: "birth",
			title: "誕生日",
			summary: [word("2005年生まれ"), `の${age}歳です。`],
			preview: "2005/11/23 生まれ",
			detail: [
				["2005年の11月23日、勤労感謝の日に生まれました。毎年休日です。"],
			],
		},
		faculty: {
			id: "faculty",
			title: "大学",
			summary: ["慶應義塾大学の", word("環境情報学部"), "に在籍しています。"],
			preview:
				"高校でプログラミングへ興味を持ち、情報技術を学べる学部へ進学しました。",
			detail: [
				[
					"高校時代に趣味としてプログラミングを始めたことがきっかけで、情報技術に関心を持ちました。情報技術を学びたいという思いから、慶應義塾大学の",
					link("環境情報学部", "https://www.keio.ac.jp/ja/sfc-pem/pmei/"),
					"へ進学しました。",
				],
			],
		},
		spain: {
			id: "spain",
			title: "出生地",
			summary: [
				"私の生まれは",
				word("スペイン"),
				"ですが、幼少期は主に日本で過ごしました。",
			],
			preview: "親の仕事の都合でマドリードで生まれ、すぐに日本へ帰国しました。",
			detail: [
				[
					"両親が仕事の都合でスペインへ赴任していたことにより、スペインのマドリードで生まれました。1歳になる前に帰国し、幼少期は日本で過ごしたため、スペインで生活した記憶はありません。",
				],
			],
		},
		korea: {
			id: "korea",
			title: "韓国生活",
			summary: [
				"小学5年生の夏に",
				word("韓国"),
				"へ移り、インターナショナルスクールに通いました。",
			],
			preview:
				"2016年8月から2019年8月まで、Dwight School Seoulに通っていました。",
			detail: [
				[
					"小学5年生だった2016年8月に、父の仕事の都合で韓国へ移住しました。2019年8月まで、インターナショナルスクール「",
					link("Dwight School Seoul", "https://dwight.or.kr/"),
					"」に通っていました。",
				],
			],
		},
		computer: {
			id: "computer",
			title: "初めてのMacBook",
			summary: [
				"韓国の学校で使い始めた",
				word("MacBook"),
				"をきっかけに、コンピューターに興味を持ちました。",
			],
			preview:
				"授業用に買ってもらった一台のMacBookで、設定を変えたり便利なアプリを試したりすることに夢中になりました。",
			detail: [
				[
					"韓国の学校では授業用にMacBookが必要で、両親に買ってもらいました。初めての自分のデジタル機器でした。",
				],
				[
					"設定を変えたり、便利なアプリを探して試したりするうちに、コンピューターでできることを知るのが楽しくなりました。",
				],
			],
		},
		education: {
			id: "education",
			title: "韓国の学校での学び",
			summary: [
				"授業では",
				word("デジタル制作やプログラミング"),
				"にも触れました。",
			],
			preview:
				"音楽・映像・3Dモデルなどを制作し、ScratchやPythonでプログラミングの初歩を学びました。",
			detail: [
				[
					"韓国の学校では、レポートや発表資料の作成に加え、音楽・映像・デジタルアート・3Dモデルの制作に取り組みました。",
				],
				[
					"プログラミング入門用のWebサービス「Scratch」やPythonにも触れました。この授業での経験をきっかけに、高校ではPythonを本格的に独学しました。",
				],
			],
		},
		usa: {
			id: "usa",
			title: "米国での学校生活",
			summary: [
				"2019年8月に",
				word("米国へ移り"),
				"、現地の学校に通いました。",
			],
			preview:
				"メリーランド州の公立中学校と高校に通い、途中からはコロナ禍でオンライン授業になりました。",
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
					"途中からコロナ禍で授業がオンラインになり、米国での生活の後半は日本の高校を受験するための勉強に力を入れました。",
				],
			],
		},
		highSchool: {
			id: "highSchool",
			title: "日本の高校への進学",
			summary: [
				"2020年12月に高校受験のため帰国し、",
				word("慶應義塾高等学校へ進学"),
				"しました。",
			],
			preview:
				"米国で受験勉強を進め、帰国子女受験で慶應義塾高等学校へ進学しました。以降は日本で暮らしています。",
			detail: [
				[
					"米国で受験勉強を進め、2020年12月に帰国しました。帰国子女受験で",
					link("慶應義塾高等学校", "https://www.hs.keio.ac.jp/"),
					"へ進学し、以降は日本で暮らしています。",
				],
			],
		},
		overseas: {
			id: "overseas",
			title: "海外生活から得た視点",
			summary: [
				"こうした",
				word("海外での経験"),
				"は、異なる考え方を受け止め、物事を別の角度から考える土台になっています。",
			],
			preview:
				"さまざまな文化や価値観に触れた経験が、アイデアを出すときや問題の解決に役立っています。",
			detail: [
				[
					"海外でさまざまな文化や価値観に触れた経験は、アイデアを出したり、問題を別の角度から捉えたりするときに役立っています。",
				],
				[
					"自分と異なる考え方を受け止めることは、新しい環境に適応したり、慣れない問題に柔軟に対応したりする力にもつながったと感じています。",
				],
			],
		},
		ski: {
			id: "ski",
			title: "高校で始めた競技スキー",
			summary: ["高校では", word("スキー部"), "に所属していました。"],
			preview:
				"回転・大回転などのアルペンスキーに取り組み、高校2・3年次には関東大会へ進出しました。",
			detail: [
				[
					"高校のスキー部では、回転・大回転などのアルペンスキーに取り組みました。毎年県大会に出場し、高校2・3年次には関東大会へ進出しました。",
				],
			],
		},
		festival: {
			id: "festival",
			title: "日吉祭の制作活動",
			summary: [word("文化祭の実行委員会"), "でも活動していました。"],
			preview:
				"日吉祭の実行委員会で、動画編集やポスター・パンフレット制作を担当しました。",
			detail: [
				[
					"慶應義塾高等学校の文化祭「日吉祭」の実行委員会で、動画編集やポスター・パンフレット制作を担当しました。",
				],
				[
					"制作した",
					link("パンフレット", "/works"),
					"はWorksで紹介しています。",
				],
			],
		},
		coordination: {
			id: "coordination",
			title: "副実行委員長の役割",
			summary: ["高校3年次には", word("副実行委員長"), "を務めました。"],
			preview:
				"委員会の取りまとめと、ブース企画者・外部業者・学校事務との調整を担当しました。",
			detail: [
				[
					"日吉祭の副実行委員長として、実行委員会の内部を取りまとめました。ブース企画者や外部業者との連絡・対応、学校事務との協議・交渉も担当しました。",
				],
				[
					"生徒の企画をできる限り実現しながら、安全面を重視する学校側にも納得してもらえるよう、関係者の間で調整を重ねました。",
				],
			],
		},
		festivalRules: {
			id: "festivalRules",
			title: "文化祭の開催ルールを決める",
			summary: [
				"生徒と学校の間に立ち、",
				word("開催ルールの調整"),
				"にも取り組みました。",
			],
			preview:
				"入場・飲食・金銭管理・警備のルールについて、生徒の希望と学校が求める安全対策を両立できるよう話し合いました。",
			detail: [
				[
					"日吉祭では、生徒が実現したい企画と、学校が求める感染症対策の両立が課題でした。野球部の甲子園優勝によって多くの来場者が訪れる可能性もあり、入場制限や警備の方法を検討する必要がありました。",
				],
				[
					"一般の来場者を受け入れる範囲、飲食の制限、企画にかかる費用と売上の扱い、警備の費用などについて、実行委員会と学校事務で協議を重ねました。",
				],
				[
					"生徒の要望をできる限り取り入れながら学校の許可を得られるルールを実行委員会で決め、大きな不満や問題なく文化祭を終えることができました。",
				],
			],
		},
		bot: {
			id: "bot",
			title: "初めて作ったBOTアプリ",
			summary: [
				"高校時代には、授業で触れたPythonを本格的に独学し、初めて",
				word("BOTアプリ"),
				"を作りました。",
			],
			preview:
				"Discord上で応答や管理を自動化するアプリです。Pythonを独学しながら開発しました。",
			detail: [
				[
					"初めて作ったのは、チャット・通話サービスの",
					link("Discord", "https://discord.com/"),
					"上で動くBOTです。投稿への応答やコミュニティの管理を自動化します。",
				],
				[
					"Discordを操作の窓口に、インターネット経由でサービスと連携して動くため、広い意味でウェブアプリの一種と捉えています。学校で触れたPythonを高校で本格的に独学し、開発に使いました。",
				],
			],
		},
		development: {
			id: "development",
			title: "BOT開発を続ける理由",
			summary: [
				"コミュニティの運営を支えるために始めた",
				word("開発・運用"),
				"を現在も続けています。",
			],
			preview:
				"友人に誘われて参加したコミュニティで、運営中に不便さを感じたことがBOTを自作するきっかけでした。",
			detail: [
				[
					"友人に誘われて参加したDiscordコミュニティで運営に携わるうちに、既存のBOTに不便さを感じ、自作を始めました。現在も開発・運用を続けています。",
				],
				[
					"機能や担当範囲は",
					link("Worksの「小惑星」", "/works"),
					"で紹介しています。",
				],
			],
		},
		study: {
			id: "study",
			title: "大学での学びと開発",
			summary: [
				"大学では",
				word("情報技術"),
				"を幅広く学び、このサイトの開発にも生かしています。",
			],
			preview:
				"インターネット、ソフトウェア設計、アルゴリズム、セキュリティ、電子回路などを学んでいます。",
			detail: [
				[
					"大学では、インターネットの仕組み、ソフトウェアの設計、アルゴリズム、セキュリティ、電子回路などを学んでいます。",
				],
				["このサイトも、学んだことを実際の開発に生かす取り組みの一つです。"],
			],
		},
		research: {
			id: "research",
			title: "所属する研究室",
			summary: [word("研究室"), "にも所属し、"],
			preview: "SFC-RG合同研究室のDelightグループに所属しています。",
			detail: [
				[
					link("SFC-RG合同研究室", "https://rg.sfc.keio.ac.jp/ja/"),
					"の",
					link("Delightグループ", "https://delight.sfc.wide.ad.jp/ja/"),
					"に所属しています。",
				],
				[
					"グループでは、複数のコンピューターが連携して動く分散システムや、オンライン上の利用者を識別するデジタルアイデンティティを研究しています。",
				],
			],
		},
		identity: {
			id: "identity",
			title: "デジタルアイデンティティへの関心",
			summary: [
				"特に",
				word("デジタルアイデンティティ"),
				"に関心があり、セキュリティと使いやすさについて学んでいます。",
			],
			preview:
				"本人かどうかを確かめる「認証」と、利用できる範囲を管理する「認可」に関心があります。",
			detail: [
				[
					"デジタルアイデンティティは、オンライン上の利用者を識別するための情報です。",
				],
				[
					"私は本人かどうかを確かめる「認証」や、何を利用できるかを管理する「認可」に関心があります。安全性と使いやすさの両面から学んでいます。",
				],
			],
		},
		skiClub: {
			id: "skiClub",
			title: "大学でも続けるスキー",
			summary: [
				"大学でも",
				word("スキー"),
				"を続け、趣味として楽しんでいます。",
			],
			preview:
				"リーゼンスキークラブに所属し、高校で始めた競技スキーを続けています。",
			detail: [
				[
					"大学ではリーゼンスキークラブに所属し、高校で始めた競技スキーを趣味として続けています。",
				],
			],
		},
	} satisfies Record<string, ProfilePassage>;
	return [
		{
			id: "intro",
			paragraphs: [[passages.nickname], [passages.birth, passages.faculty]],
		},
		{
			id: "childhood",
			paragraphs: [
				[passages.spain, passages.korea],
				[passages.computer, passages.education],
				[passages.usa, passages.highSchool],
				[passages.overseas],
			],
		},
		{
			id: "high-school",
			paragraphs: [
				[passages.ski, passages.festival],
				[passages.coordination, passages.festivalRules],
			],
		},
		{ id: "development", paragraphs: [[passages.bot, passages.development]] },
		{
			id: "university",
			paragraphs: [
				[passages.study],
				[passages.research, passages.identity],
				[passages.skiClub],
			],
		},
	];
}
