---
name: kuri-net-test-guideline
description: Use when adding, changing, organizing, diagnosing, or running kuri-net tests, including current co-located Bun test placement, Japanese requirement comments, Given-When-Then style, test case design, module mocks, deterministic domain tests, Playwright E2E, auth tests, or verification coverage.
---

# kuri-net Test Guideline

変更した契約を最小の有効な境界で固定し、共有基盤を触った場合だけ検証範囲を広げる。

## テストの配置

- テスト配置は kuri-net の現在の構造を正本とする。
- pure logic、policy、server function の Bun テストは対象 module の近くへ `*.test.ts` として置く。
- browser、route、passkey、実 DB をまたぐ契約は `e2e/*.e2e.ts` に置く。
- unit / integration の大分類だけを理由に新しいトップレベル test folder を増やさない。
- production file との1対1対応より、壊れたときにどの契約が失敗したか分かるまとまりを優先する。
- test helper は複数ファイルで同じ契約を共有するときだけ抽出する。
- 将来用の空 test file や分類だけのディレクトリを作らない。

## 要件の記述

- 新規または変更するテストは、コードの意図から外部に見える機能要件を先に特定する。
- authorization、副作用の抑止、冪等性、error handling、安定性、決定性など、守るべき非機能要件がある場合は明示する。
- test body の先頭に、日本語で `// 機能要件：...` と、必要な場合だけ `// 非機能要件：...` を書く。
- 要件コメントには private function の呼び出し順ではなく、入力、操作、結果、副作用など外から見た契約を書く。
- 意味のある非機能要件がない場合は、形式を埋めるために作らず `// 機能要件：...` だけを書く。
- `describe` は対象の module、domain、公開契約を簡潔に表す。production symbol を表す場合は既存の英語名をそのまま使う。
- `test` / `test.each` の title は日本語で期待する振る舞いを表し、「正常系」「成功する」のように単独では仕様が分からない名前を避ける。
- 詳細仕様は test title と要件コメントで表し、テスト専用の冗長な識別名を追加しない。

## Given-When-Then

- test body は原則として `// Given`、`// When`、`// Then` に分ける。
- Given には前提、入力、mock、fixture の準備を書く。
- When には検証対象となる操作を1つに絞って書く。
- Then には返り値、表示、error、永続化状態、副作用の有無を書く。
- 例外 assertion、schema inspection、ごく小さい pure function など、実行と検証が自然に一体化する場合は `// When / Then` や `// Given / When` と併記してよい。
- 各 phase が明確な場合は、複数 phase を不必要にまとめない。

例:

```ts
test("外部のユーザーIDを無視してセッションのユーザーを取得する", async () => {
	// 機能要件：メモ取得では認証済みセッションのユーザーIDを使用する。
	// 非機能要件：クライアント指定のユーザーIDで他人のメモへアクセスさせない。
	// Given
	getAuthenticatedSessionMock.mockResolvedValue({
		user: { id: "current-user" },
	});

	// When
	const callWithUntrustedUserID = getCurrentUserNotepad as (
		userID: string,
	) => ReturnType<typeof getCurrentUserNotepad>;
	const result = await callWithUntrustedUserID("another-user");

	// Then
	expect(getNotepadByUserIDMock).toHaveBeenCalledWith("current-user");
	expect(getNotepadByUserIDMock).not.toHaveBeenCalledWith("another-user");
	expect(result.content).toBe("自分のメモ");
});
```

## Bun テスト

- 外から観測できる結果、状態遷移、境界値、拒否時の副作用不在を検証する。
- マインスイーパーなど seed を受け取れる domain は固定 seed と明示した盤面で決定的に検証する。
- auth / repository mock は最小限の interface にし、本番側の型・guard を test の都合で弱めない。
- `mock.module` を使う場合は対象 module の import より前に mock を登録し、各 test で呼び出し履歴を初期化する。
- 実装の内部呼び出し順だけを固定する assertion より、返り値と副作用の契約を優先する。

## テストケース設計

- 同値分割: 同じ扱いになる入力・状態から代表値を選び、同じ意味のケースを重複させない。
- 境界値分析: 文字数、件数、しきい値、日時などは境界ちょうどと前後の値を確認する。
- デシジョンテーブル: session、user state、入力妥当性など複数条件で結果が変わる場合は、結果が変化する組み合わせを整理してから `test.each` などへ落とす。
- 状態遷移: 登録、更新、削除、cleanup、再ログインなどは遷移前後の状態と副作用を確認する。
- エラー推測: 過去に壊れた経路、browser・DB・認証境界、missing row、途中失敗を明示的に確認する。
- すべての組み合わせを機械的に増やさず、結果が変わる条件、境界、危険な拒否経路を優先する。
- 拒否ケースでは、error や拒否表示だけでなく、DB write、repository call、session 更新などの副作用が起きないことも assert する。

## セキュリティと状態

- 認証必須処理は session 不在、無効 state、他ユーザー入力、失敗途中を含める。
- 拒否 test では error だけでなく、DB write、repository call、状態更新が起きていないことも確認する。
- DB migration や互換処理は、空 DB、適用済み DB、部分初期化など意味の異なる状態を混同しない。

## Playwright E2E

- `mise run test:e2e` は実行中のアプリ、Chrome、loopback-only の検証 DB を前提とする。
- E2E は実データを変更するため、共有・本番 DB を接続先にしない。既存の host guard を削除しない。
- passkey は Chrome DevTools Protocol の virtual authenticator を使い、登録、再ログイン、cleanup など browser 境界でしか保証できない契約を検証する。
- UI 文言変更で selector が変わる場合は、role と accessible name を優先する。

## 実行範囲

- 反復中: 対象 test file または `mise run test`。
- 通常の最終確認: `mise run check`。
- auth / DB / browser flow: unit test に加え、環境を安全に用意できる場合だけ `mise run test:e2e`。
- E2E を実行していない場合は、実行済みと推測せず明記する。
- 既存テストは関連変更で触れるときに新形式へ寄せる。形式統一だけを目的に無関係なテストを一括変更しない。
