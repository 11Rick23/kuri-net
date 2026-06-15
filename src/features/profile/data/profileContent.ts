export type Topic = {
	title: string;
	body: RichTextContent;
};

export type ProfileParagraph = {
	id: string;
	content: RichTextContent;
};

export type RichTextLink = {
	text: string;
	href: string;
};

export type RichTextContent = string | (string | RichTextLink)[];

export const profileParagraphs = [
	{
		id: "intro",
		content:
			"初めまして、kuri-kuri です。11Rick23 というハンドルネームも使っています。",
	},
	{
		id: "background",
		content:
			"私は小学生の頃からコンピューターに触れ、その技術が持つ可能性に興味を持ってきました。様々なサービスを利用する中で、「本当に自分に合ったサービスを使うためには、自分で作る必要がある」と考えるようになり、高校時代にプログラミングを始めました。",
	},
	{
		id: "university",
		content: [
			"現在は、慶應義塾大学の環境情報学部で情報技術を中心に学習を行っています。大学では ",
			{
				text: "SFC-RG合同研究室",
				href: "https://rg.sfc.keio.ac.jp/ja",
			},
			" ",
			{
				text: "Delightグループ",
				href: "https://delight.sfc.wide.ad.jp/ja",
			},
			" に所属しており、認証認可やそのユーザビリティに興味を持っています。",
		],
	},
	{
		id: "development",
		content:
			"私は、いかに優れた機能を備えたアプリでも、使い勝手が悪ければ価値が半減すると考えています。そのため、Webアプリを中心とした個人開発では「見やすい」「分かりやすい」「使いやすい」の3点をモットーとしたUI/UX設計を心がけています。",
	},
] satisfies ProfileParagraph[];

export const interests: Topic[] = [
	{
		title: "セキュリティ",
		body: "パスキー・WebAuthnに興味を持ち、そこから認証・認可やセキュリティ全般へと関心が広がりました。セキュリティはどのようなアプリでも大切な要素であるにも関わらず、正しい理解や実装が難しい分野だと感じています。普段は意識されにくい領域だからこそ、技術者としてしっかりと向き合いたいです。",
	},
	{
		title: "ウェブ開発",
		body: "ウェブアプリはインターネットの基盤であり、私はその広い汎用性と拡張性に魅力を感じています。さまざまな端末で動作し、インターフェースとしても柔軟に設計できるWebには、Webならではの強みがあると感じています。",
	},
	{
		title: "ユーザビリティ",
		body: "技術的に優れた機能を提供するだけでは不十分で、ユーザビリティの高いUI/UX設計が大切だと考えています。ユーザーが直感的に理解し、快適に使えるインターフェースを作ることは、技術者としての大きな挑戦であり、大きなやりがいを感じます。",
	},
	{
		title: "AI",
		body: "近年の生成AIやLLMは非常に優秀です。しかし、これらの技術を最大限活用するためには、AIの特性を理解し、適切なインターフェースを設計することが重要であると考えています。AIはあくまでツールであり、その力を引き出すのは人間です。AIを上手に使いこなせる能力を身につけたいと思っています。",
	},
];

export const activities: Topic[] = [
	{
		title: "大学・研究室",
		body: "大学ではインターネット、セキュリティ、ソフトウェアアーキテクチャ、アルゴリズム、電子回路など、幅広い分野の基礎的な学習を行っています。また、所属している研究室では、セキュリティやユーザビリティに関して詳細な学習を行っています。",
	},
	{
		title: "アルペンスキー",
		body: "高校時代にアルペンスキー（回転・大回転などの競技スキー）を始め、大学でもサークルに所属し、趣味として継続しています。",
	},
	{
		title: "ゲーム",
		body: "プレイしているゲームの数は多くありませんが、Splatoon、原神、Shadowverseなどのゲームをやっています。",
	},
];
