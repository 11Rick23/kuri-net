type ProfileNote = {
	title: string;
	paragraphs: string[];
	links?: { text: string; href: string }[];
};

export const profileNotes = {
	nickname: {
		title: "kuri-kuri",
		paragraphs: [
			"幼い頃に友達に冗談で呼ばれたあだ名「くりっくりー」が元になっています。11Rick23 というハンドルネームを使うこともあります。",
		],
	},
	birth: {
		title: "2005年11月23日生まれ",
		paragraphs: ["2005年11月23日、勤労感謝の日に生まれました。"],
	},
	spain: {
		title: "スペイン・マドリード",
		paragraphs: [
			"父の仕事の都合で、スペインのマドリードに生まれました。1歳になる前に日本へ帰国したため、スペインでの記憶はありません。",
		],
	},
	japan: {
		title: "日本での生活",
		paragraphs: [
			"2016年8月までと、2020年12月以降は日本で暮らしています。",
			"スペインからの帰国後、小学5年生までは日本の幼稚園・区立小学校に通っていました。韓国・米国を経て、高校入学をきっかけに帰国し、以降は日本に住んでいます。",
		],
	},
	korea: {
		title: "韓国での生活",
		paragraphs: [
			"2016年8月から2019年8月まで、韓国で暮らしていました。父の仕事の都合で、小学5年生の夏に移住しました。",
			"Dwight School Seoul というインターナショナルスクールに通い、中学1年生の夏頃に米国へ移りました。",
		],
	},
	usa: {
		title: "米国での生活",
		paragraphs: [
			"2019年8月から2020年12月まで、米国で暮らしていました。父の仕事の都合で、中学1年生の夏に韓国から移住しました。",
			"メリーランド州の公立中学校 Thomas W. Pyle Middle School に1年ほど、同州の公立高校 Walt Whitman High School に半年ほど通い、高校受験をきっかけに帰国しました。",
			"当時はコロナ禍の真っ只中。途中から学校がすべてオンラインになるなど、大変な時期だったことが印象に残っています。",
		],
	},
	faculty: {
		title: "慶應義塾大学 環境情報学部",
		paragraphs: [
			"プログラミングに興味を持ったことから、情報系の学部である環境情報学部へ進学しました。",
		],
		links: [
			{
				text: "湘南藤沢キャンパス（SFC）",
				href: "https://www.keio.ac.jp/ja/sfc/",
			},
			{
				text: "総合政策学部・環境情報学部",
				href: "https://www.keio.ac.jp/ja/sfc-pem/pmei/",
			},
		],
	},
	schoolPolicy: {
		title: "最初のMacBook",
		paragraphs: [
			"韓国で通っていた Dwight School Seoul はIT教育に力を入れており、授業でも Google Classroom などを積極的に使っていました。",
			"入学時に各家庭で MacBook を購入する必要があり、両親に MacBook Pro（Retina, 13-inch, Early 2015）を買ってもらいました。",
			"このMacBookを使ううちに、コンピューターへの関心が一気に強まりました。",
		],
	},
	education: {
		title: "学校でのIT教育",
		paragraphs: [
			"学校での学習を通じて、コンピューターやソフトウェアに関するさまざまな経験を積むことができました。",
			"3年間で、コンピューターの操作、インターネットでの情報収集、メールやクラウドの使い方を学びました。Google Document や Google Slide でレポート・プレゼンテーションも制作しました。",
			"GarageBand での音楽制作、Canva などでのデジタルアート、カメラや動画編集アプリを使った映像制作にも取り組みました。",
			"Sketch や Python によるプログラミング入門、Fusion 360 での3Dモデル作成など、多様なIT技術に触れることができました。",
		],
	},
	tinkering: {
		title: "コンピューターでの遊び",
		paragraphs: [
			"当時はスマホを持っておらず、MacBook が初めて手に入れた自分のデジタル機器でした。OSやアプリの設定を変えたり、ファイルを整理したり、便利なアプリを入れたりすることを楽しんでいました。",
			"より便利なツールや設定を探して、ブログやまとめ記事を読み、新しい機能やアプリを積極的に試していました。",
			"この遊びで得た知識が、今でも開発や技術の理解に役立っていると感じています。",
		],
	},
	ski: {
		title: "高校のスキー部",
		paragraphs: [
			"「回転」「大回転」などのアルペンスキーに取り組んでいました。毎年県大会に出場し、関東大会やインターハイを目指して練習に励みました。",
			"2・3年次には関東大会への進出を果たしました。",
		],
	},
	festival: {
		title: "日吉祭実行委員会",
		paragraphs: [
			"慶應義塾高等学校の文化祭「日吉祭」の実行委員会に所属し、主に動画編集やポスター・パンフレット制作を担当しました。",
			"3年次には副実行委員長を務め、委員会全体や文化祭を取りまとめる経験をしました。",
		],
	},
	development: {
		title: "Discord BOTの開発",
		paragraphs: [
			"コロナ禍の外出自粛中、オンラインの友人に誘われて Discord コミュニティに参加しました。その後、管理者メンバーの一員になりました。",
			"管理に使っていた既存の自動化アプリケーション（Discord BOT）がコミュニティのニーズを満たしておらず、不便さを感じたことから、専用BOTの自作に挑戦しました。",
			"このBOTは、現在まで継続して開発・運用しています。",
		],
	},
	study: {
		title: "大学での学習",
		paragraphs: [
			"特定の分野に限定せず、多様な講義を受講しています。インターネット、ソフトウェアアーキテクチャ、アルゴリズム、セキュリティ、ユビキタスシステム、電子回路など、情報系の分野を幅広く学びました。",
		],
	},
	research: {
		title: "SFC-RG・Delightグループ",
		paragraphs: [
			"SFC-RG合同研究室の Delight グループに所属しています。研究室では分散システムやデジタルアイデンティティに関する研究を行っています。",
			"私は特にデジタルアイデンティティに興味があり、現在はセキュリティやユーザビリティに着目して学習しています。",
		],
		links: [
			{ text: "SFC-RG合同研究室", href: "https://rg.sfc.keio.ac.jp/ja" },
			{ text: "Delightグループ", href: "https://delight.sfc.wide.ad.jp/ja" },
		],
	},
	skiClub: {
		title: "リーゼンスキークラブ",
		paragraphs: [
			"大学ではスキーサークルのリーゼンスキークラブに所属しています。高校のスキー部から続ける形で、競技スキーに取り組んでいます。",
		],
	},
	overseas: {
		title: "海外生活",
		paragraphs: [
			"海外生活を通じて多種多様な人・環境・価値観に触れてきたことは、私の大きな強みです。",
		],
	},
	highSchool: {
		title: "高校への進学",
		paragraphs: [
			"米国への移住後は、コロナウイルスの流行と高校受験の時期が重なり、受験勉強に注力しました。その結果、帰国子女受験で慶應義塾高等学校へ入学しました。",
		],
	},
} satisfies Record<string, ProfileNote>;

export type ProfileNoteId = keyof typeof profileNotes;
type StoryPart = string | { text: string; note: ProfileNoteId };
type StoryChapter = {
	id: string;
	paragraphs: StoryPart[][];
};

export function createProfileStory(age: number): StoryChapter[] {
	return [
		{
			id: "background",
			paragraphs: [
				[
					"初めまして、",
					{ text: "kuri-kuri", note: "nickname" },
					"と申します。",
				],
				["私は", { text: "2005年生まれ", note: "birth" }, `の${age}歳です。`],
				[
					{ text: "スペイン", note: "spain" },
					"生まれで、",
					{ text: "日本", note: "japan" },
					"、",
					{ text: "韓国", note: "korea" },
					"、",
					{ text: "米国", note: "usa" },
					"で育ちました。",
				],
				[
					{ text: "海外生活", note: "overseas" },
					"が、自分の強みにつながっています。",
				],
			],
		},
		{
			id: "computers",
			paragraphs: [
				[
					"小学生の頃に手にした",
					{ text: "MacBook", note: "schoolPolicy" },
					"をきっかけに、コンピューターに興味を持ちました。",
				],
				[
					{ text: "学校でのIT教育", note: "education" },
					"や",
					{ text: "コンピューターでの遊び", note: "tinkering" },
					"を通じて、学びを広げてきました。",
				],
			],
		},
		{
			id: "high-school",
			paragraphs: [
				[
					{ text: "高校", note: "highSchool" },
					"では、",
					{ text: "スキー部", note: "ski" },
					"や",
					{ text: "文化祭の実行委員会", note: "festival" },
					"に所属していました。",
				],
				[
					"また、プログラミングに興味を持ち、Pythonを独学して初めて",
					{ text: "ウェブアプリを開発", note: "development" },
					"しました。",
				],
			],
		},
		{
			id: "university",
			paragraphs: [
				[
					"現在は慶應義塾大学の",
					{ text: "環境情報学部", note: "faculty" },
					"で",
					{ text: "情報技術を学び", note: "study" },
					"、",
					{ text: "研究室", note: "research" },
					"にも所属しています。",
				],
				[
					{ text: "サークル", note: "skiClub" },
					"で趣味のスキーも続けています。",
				],
			],
		},
	];
}
