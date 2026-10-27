import { describe, expect, test } from "bun:test";
import { parseAnnouncements } from "@/features/home/data/announcements";

describe("parseAnnouncements", () => {
	test("日付順に並べ、同日はファイルの上側を優先する", () => {
		// 機能要件：記載順にかかわらず最新のお知らせを先頭にし、同日は記載順を保つ。
		// Given
		const markdown = `# お知らせ

## 2026-10-01 過去のお知らせ

以前の本文。

## 2026-10-27 最新のお知らせ

新しい本文。

## 2026-10-27 同日の次のお知らせ

別の本文。`;

		// When
		const announcements = parseAnnouncements(markdown);

		// Then
		expect(announcements.map(({ title }) => title)).toEqual([
			"最新のお知らせ",
			"同日の次のお知らせ",
			"過去のお知らせ",
		]);
	});

	test("改行コードに依存せず日付・タイトル・本文の段落を読み取る", () => {
		// 機能要件：Markdownから日付・タイトルを取り出し、本文の改行と段落を保つ。
		// Given
		const markdown =
			"# お知らせ\r\n\r\n## 2026-10-27 更新しました\r\n\r\n1行目。\r\n2行目。\r\n\r\n次の段落。\r\n";

		// When
		const announcements = parseAnnouncements(markdown);

		// Then
		expect(announcements).toEqual([
			{
				date: "2026-10-27",
				title: "更新しました",
				paragraphs: ["1行目。\n2行目。", "次の段落。"],
			},
		]);
	});

	test.each(["", "# お知らせ\n"])(
		"記事がなければ空の一覧を返す: %j",
		(markdown) => {
			// 機能要件：お知らせ未登録時には空表示を選択できる。
			// Given / When / Then
			expect(parseAnnouncements(markdown)).toEqual([]);
		},
	);

	test.each([
		"## 2026-02-30 存在しない日付",
		"## 2026-13-01 存在しない月",
		"## 2026/10/27 日付の形式違い",
		"## 2026-10-27",
	])("不正な見出しを通知する: %s", (markdown) => {
		// 機能要件：日付やタイトルの記載ミスを黙って公開しない。
		// Given / When / Then
		expect(() => parseAnnouncements(markdown)).toThrow();
	});
});
