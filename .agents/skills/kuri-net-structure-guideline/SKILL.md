---
name: kuri-net-structure-guideline
description: Use when locating or placing kuri-net routes, features, shared components, database code, types, migrations, tests, assets, or configuration, and when deciding which layer owns a change.
---

# kuri-net Structure Guideline

既存の責務境界を優先し、機能追加のために新しいトップレベル構造を安易に作らない。

## プロジェクトマップ

- `src/app/`: Next.js App Router のページ、レイアウト、API route。機能を接続する薄い層とする。
- `src/features/`: 機能固有の画面、コンポーネント、hook、server action、domain/data ロジック。
- `src/shared/`: 複数機能で実際に共有する UI、provider、型、エラー、utility。
- `src/database/`: Drizzle の接続、スキーマ、マイグレーション実行。
- `src/types/`: DB やライブラリ境界で必要な補助型。
- `drizzle/`: 生成された SQL マイグレーションとメタデータ。
- `e2e/`: Playwright によるブラウザ E2E テスト。
- `public/`: アプリ自身が配信する静的ファイル。Works の外部アセットはここへ重複させない。
- `.agents/`: AI エージェント向け共有スキルと運用文書。

## 配置の判断

- route ファイルでは feature の Screen や server function を呼び出し、複雑な UI・状態・domain 処理を抱え込まない。
- 1機能だけが使うコードは `src/features/<feature>` に置く。将来の再利用予想だけで `src/shared` へ移動しない。
- 複数機能で同じ契約を共有すると確認できた UI・型・utility だけを `src/shared` へ置く。
- ツール共通の frame、badge、menu は `src/features/tools/components`、各ツール固有実装は `src/features/tools/<tool>` に置く。
- server action と DB repository は、UI component から分離し、既存の `server/`、`data/` の分け方に合わせる。
- 大きくなったファイルは、画面、component、hook、domain、data の責務で分割する。汎用 `utils.ts` を逃げ場にしない。

## 変更時に確認する入口

- 新しい route: `src/app` と対応する `src/features`。
- 新しいツール: `src/features/tools/toolDefinitions.ts`、`src/app/apps`、`src/features/tools/components`。
- 横断 provider: `src/app/providers.tsx`。
- 認証: `src/features/auth` と `$kuri-net-auth-guideline`。
- 永続化: `src/database`、feature の `data/`、`drizzle/` と `$kuri-net-database-guideline`。
- セットアップや構造の変更: `README.md`。
