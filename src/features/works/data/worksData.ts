import type { WorkEntry } from "@/features/works/types";

export const worksData: WorkEntry[] = [
	{
		title: "ハロメイト",
		links: [
			{
				label: "ソースコード",
				href: "https://github.com/11Rick23/GDGoC-Del4-Demo",
			},
			{
				label: "GDGoC Japan Hackathon 公式ページ",
				href: "https://gdg.community.dev/events/details/google-gdg-on-campus-university-of-aizu-fukushima-japan-presents-gdgoc-japan-hackathon/cohost-gdg-on-campus-tokyo-metropolitan-university-tokyo-japan/",
			},
		],
		summary: "GDGoC Japan Hackathon にて『AI賞』を受賞したウェブアプリ",
		stack: [
			"TypeScript",
			"Python",
			"Next.js",
			"FastAPI",
			"PostgreSQL",
			"pgvector",
			"WebSocket",
			"Gemini",
		],
		coverImageAssetKey: "works/hello_mate-cover.png",
		coverAlt: "GDGoC Japan Hackathon のロゴ",
		lead: "AIエージェントを活用し、ストレスなく新しい友達を見つけられることを目指したウェブアプリです。",
		period: "2026年3月",
		role: "開発基盤作成 / 認証システム設計 / DMシステム設計 / DB管理",
		teamSize: "4人グループ",
		sections: [
			{
				heading: "背景",
				paragraphs: [
					"大学で同じ研究室に所属するメンバー4人で Google Developer Group on Campus Japan が主催する GDGoC Japan Hackathon に出場しました。",
					"私たちは東京会場で出場したのですが、本会場の参加者は100人を超えており、かなりの激戦区となっていました。その中で私たちのチームが作成したウェブアプリ『ハロメイト』は『AI賞』を受賞しました。",
				],
			},
			{
				heading: "プロジェクトの概要",
				media: [
					{
						type: "video",
						title: "ハロメイト 発表用デモ動画",
						assetKey: "works/hello_mate-demo.mp4",
						placement: "before",
					},
				],
				paragraphs: [
					"『ハロメイト』はAIを活用した友達探しアプリで、手軽にストレスなく新しい友達を見つけることを目標としています。",
					"プロフィール作成の手間、個人情報公開のリスク、ぴったりの友達を探す難しさなどを、AIエージェントを活用することで解決しました。",
				],
			},
			{
				heading: "使用技術",
				paragraphs: [
					"構成は標準的な Next.js のアプリとなっており、DBのベクトリングを使ったマッチングを行う機能部分のみ、 Python と FastAPI 使ったマイクロサービスとして実装しました。",
					"フレームワークであるの Next.js および FastAPI の他には、 PostgreSQL データベースおよびそれを管理するための Drizzle-ORM 、ベクトリング化の為の pgvector ライブラリ、認証ライブラリとして NextAuth.js 、ウェブソケット実装のための ws ライブラリなどを使用しています。",
					"AIエージェントの実装には Gemini API を利用しました。",
					"その他詳しい技術スタックの説明は、ソースコードのREADMEを参照してください。",
				],
			},
			{
				heading: "担当箇所",
				paragraphs: [
					"私はこのプロジェクトにおいて、開発基盤の作成、認証基盤の設計、DMシステムの設計、DB管理を担当しました。",
					"開発基盤の作成では、プロジェクトのリポジトリ構成や開発環境の整備、プロジェクト進行の管理などを行いました。",
					"認証基盤の設計では、ユーザー登録・認証フローからセッション管理までの設計・実装を行いました。",
					"DMシステムの設計では、リアルタイムでのメッセージ送受信が可能なメッセージングシステムをWebSocketを用いて設計・実装しました。",
					"DB管理では、データベーススキーマの設計や管理などを担当しました。",
				],
			},
		],
	},
	{
		title: "Kuri-Net",
		links: [
			{
				label: "ソースコード",
				href: "https://github.com/11Rick23/kuri-net",
			},
		],
		summary: "個人制作のポートフォリオサイト",
		stack: [
			"TypeScript",
			"Next.js",
			"Tailwind CSS",
			"PostgreSQL",
			"Drizzle ORM",
			"WebAuthn",
			"Catppuccin",
		],
		lead: "自分の制作物や技術的な取り組みを公開しつつ、実際に使えるウェブツールも提供している個人サイトです。",
		period: "2025 - 現在",
		role: "フルスタック開発",
		teamSize: "個人",
		sections: [
			{
				heading: "背景・目的",
				paragraphs: [
					"私がこのプロジェクトを始めた理由は、自身の技術力をアウトプットする場が欲しかったからです。",
					"このプロジェクト以前の私のプログラミング経験は、自分が所属するDiscordコミュニティ用のアプリケーション開発のみでした。その開発経験は私の技術力を育むために非常に有意義でしたが、プラットフォーム自体がマイナーであったり、用途が非常に限定的であったことから、その成果を人に説明することが困難でした。",
					"そこで私が気になったのが、ウェブプラットフォームです。ウェブサイトであれば外部への公開が簡単で、開発も非常に柔軟性があります。ウェブならば自分が作りたいと思ったものを自由に制作・公開できると考え、本プロジェクトを始めました。",
				],
			},
			{
				heading: "プロジェクトの概要",
				paragraphs: [
					"このウェブサイトの機能は大まかに3つに分類できます。",
					"1つ目が私の自己紹介です。Aboutページがこれに該当し、私の経歴、趣味、人となりなどを知ってもらうことが目標です。",
					"2つ目がポートフォリオです。Worksページがこれに該当し、過去のプロジェクトをまとめることで私の経験や技術力を紹介しています。",
					"3つ目がウェブツールです。Toolsページがこれに該当し、シンプルで使いやすいウェブアプリを作っています。自分が必要とするミニツールを制作・公開したり、とにかく手を動かすことが目的です。",
					"その他に制作した機能として、パスキー認証システムがあります。WebAuthn認証を学習する目的で、認証フローやセッション管理などの実装を行いました。",
				],
			},
			{
				heading: "使用技術",
				paragraphs: [
					"本サイトは Typescript で書かれており、 Next.js フレームワークを基盤としています。",
					"CSSには Tailwind CSS を使用しており、同時にカラーテーマとして Catppuccin を導入しています。",
					"DBは PostgreSQL を使用しており、その管理には Drizzle-ORM を使用しています。",
					"パスキー認証システムには SimpleWebAuthn ライブラリを使用しています。",
				],
			},
			{
				heading: "工夫した点・学んだこと",
				paragraphs: [
					"本プロジェクトでは、配色の見やすさや操作方法の分かりやすさなど、使用感に特に気を配ったUIやUXの設計を特に大切にしています。それにより、見やすいUIや分かりやすいUXの作り方を実践的に学習することができています。",
					"パスキー認証の実装は SimpleWebAuthn ライブラリを使用して行いましたが、WebAuthnの基本的な登録・認証フロー、チャレンジ管理、クレデンシャル情報の保存、セッション管理、セッション検証などは全て自前で実装し、認証システムを実運用するにあたって特に大事となってくる要点は一通り学習することができました。署名検証や認証情報解析などの低レベル処理はライブラリに依存しており、WebAuthn認証の内部動作までは学習できていません。",
				],
			},
		],
	},
	{
		title: "第74回日吉祭パンフレット",
		summary: "高校の文化祭で制作したパンフレット",
		stack: ["Adobe InDesign", "Adobe Illustrator"],
		coverImageAssetKey: "works/hiyoshi_fest-logo.png",
		coverAlt: "第74回日吉祭のロゴ",
		lead: "慶應義塾高校の文化祭である日吉祭のパンフレットを、デザインから印刷まで一貫して担当しました。",
		period: "2023年10月",
		teamSize: "日吉祭実行委員 約25人",
		role: "実行委員会副委員長",
		sections: [
			{
				heading: "背景",
				paragraphs: [
					"私は高校時代に文化祭の実行委員会に所属しており、3年生で副委員長を務めました。副委員長として委員会を統括する立場にあった私は、進行管理、企画管理、関係者との調整など、運営に必要な全ての業務に携わりました。",
					"その中でも特に力を入れたのが、パンフレットの制作でした。技術力などの都合により文化祭のパフレットは私が一人で制作することになったため、デザインから印刷までの全工程を担当しました。",
				],
			},
			{
				heading: "得られた経験・学んだこと",
				paragraphs: [
					"この機会に新しいことに挑戦してみたいと思い、本格的なデザインソフトである Adobe InDesign を使用して制作を行いました。",
					"最初は、ただ自分が好きなデザインでパンフレットを作れることが楽しいと感じていました。しかし、制作を進めていくうちに、デザインの見やすさや情報の表現方法などを工夫することに興味が湧いてきました。そこから軽くデザインの手法をリサーチし、初心者ながらにUI/UXを意識したパンフレットを作ることができました。",
					"この経験こそが私がUI/UXに興味を持つきっかけとなりました。",
				],
			},
		],
	},
];
