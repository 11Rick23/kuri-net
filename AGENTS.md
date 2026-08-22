# kuri-net AI Instructions

## 基本方針

- 正確性を優先し、既存の挙動・責務分割・命名・デザインを確認してから変更する。
- 回答、ユーザー向け文言、開発ドキュメントは、既存の英語 API 名を除いて原則日本語にする。
- 関係のないリファクタリング、仕様変更、依存関係追加、生成物更新は行わない。
- `mise.local.toml`、DB URL、認証シークレットなどの秘密情報を出力・記録しない。
- 既存の未コミット変更はユーザーの作業として扱い、上書きしない。
- 明文化された規則や確立した実装パターンがない場合は、kuri-net の技術構成と既存の責務境界に整合する規則を定める。

## スキルの使い分け

kuri-net の作業では、内容に応じて `.agents/skills` の専門スキルを使う。詳細ルールをこのファイルへ重複させない。

- 構造、配置、責務境界: `$kuri-net-structure-guideline`
- TypeScript、React、Next.js、Biome: `$kuri-net-code-style-guideline`
- レイアウト、コンポーネント、Catppuccin、アクセシビリティ: `$kuri-net-ui-guideline`
- Drizzle、PostgreSQL、リポジトリ、マイグレーション: `$kuri-net-database-guideline`
- Better Auth、パスキー、セッション、認可: `$kuri-net-auth-guideline`
- Bun テスト、要件コメント、Given-When-Then、ケース設計、Playwright: `$kuri-net-test-guideline`
- Bun、mise、起動、依存関係、検証コマンド: `$kuri-net-runtime-guideline`
- `.agents/skills`、`AGENTS.md`、`.agents/README.md` の保守: `$kuri-net-skill-maintenance`

複数領域にまたがる変更では、該当するスキルを組み合わせる。

## 作業の進め方

- `src/app` はルーティングと構成の接続に留め、機能実装は `src/features`、横断部品は `src/shared` に置く。
- Server Component / Server Action と Client Component の境界を確認し、`"use client"` の範囲を不要に広げない。
- 認証・DB・ユーザー入力を扱う変更では、クライアント値を信頼せず、サーバー側でセッションと入力を再検証する。
- セットアップ、環境変数、コマンド、構造、機能一覧、デプロイ方法を変えた場合は `README.md` も同じ変更で更新する。

## 検証

- 変更中は対象に近い `mise run test`、`mise run lint`、`mise run typecheck` から実行する。
- 最終確認は、通常 `mise run check` を使用する。
- `mise run format` はファイルを書き換えるため、意図した場合だけ実行する。
- `mise run test:e2e` は実行中のアプリ、Chrome、ループバック接続の検証用 DB が必要なため、通常の一括チェックには含めない。
- UI 変更は自動チェックに加え、必要に応じて実ブラウザでレスポンシブ表示、操作、フォーカス状態を確認する。

## AI ドキュメント管理

- `.agents/skills` を共有スキルの正本とする。
- `AGENTS.md` は常時読む入口、`.agents/README.md` はチーム向けのスキル一覧と保守方法に限定する。
- スキルを追加・削除・改名・責務変更した場合は、`$kuri-net-skill-maintenance` に従い、関連する一覧とメタデータも更新する。
