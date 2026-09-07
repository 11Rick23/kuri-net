# kuri-net

kuri-net は、プロフィール・制作物紹介とブラウザ向けツールをまとめた Next.js アプリケーションです。認証には Better Auth とパスキー、永続化には PostgreSQL と Drizzle ORM を使用します。

## 実行環境

| ツール | バージョン | 用途 |
| --- | --- | --- |
| Bun | 1.3.11 | 依存関係管理、スクリプト、ユニットテスト |
| Node.js | 25.2.1 | Next.js・Playwright 互換実行環境 |
| mise | latest | ツール管理、タスクランナー |
| PostgreSQL | 要用意 | 認証・メモ帳データの永続化 |
| Chrome | E2E 実行時 | パスキー E2E テスト |

本 README では `mise` を利用する前提でコマンドを記載します。各タスクの実体は [`mise.toml`](mise.toml) と `package.json` を参照してください。

## セットアップ

### 1. 依存関係をインストール

```bash
mise run install
```

### 2. ローカル環境変数を設定

```bash
cp mise.local.toml.example mise.local.toml
```

`mise.local.toml` の値をローカル環境に合わせて編集してください。このファイルは Git 管理対象外です。

| 変数 | 用途 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 接続 URL |
| `NEXT_PUBLIC_ASSET_BASE_URL` | Works 画像・動画を配信する公開 URL |
| `BETTER_AUTH_SECRET` | Better Auth の署名用シークレット |
| `BETTER_AUTH_URL` | アプリの公開 URL。ローカル既定値は `http://localhost:3000` |

### 3. DB マイグレーションを適用

```bash
mise run db:migrate
```

### 4. 開発サーバーを起動

```bash
mise run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。

## 開発タスク

| コマンド | 内容 |
| --- | --- |
| `mise run install` | lockfile に従って依存関係を導入 |
| `mise run dev` | 開発サーバーを起動 |
| `mise run build` | 本番用ビルドを作成 |
| `mise run start` | 作成済みの本番用ビルドを起動 |
| `mise run test` | Bun のユニットテストを実行 |
| `mise run test:e2e` | Playwright の認証 E2E テストを実行 |
| `mise run lint` | Biome lint を実行 |
| `mise run format` | Biome formatter を適用 |
| `mise run format:check` | フォーマット差分を確認 |
| `mise run typecheck` | TypeScript の型チェックを実行 |
| `mise run db:generate -- --name <name>` | Drizzle マイグレーションを生成 |
| `mise run db:migrate` | Drizzle マイグレーションを適用 |
| `mise run check` | format・lint・型・テスト・本番ビルドを一括検証 |

`mise run format` はファイルを書き換えます。`mise run test:e2e` は通常の一括チェックには含まれず、起動中のアプリ、Chrome、ループバック接続の検証用 DB が必要です。

## ディレクトリ構成

```text
src/app/       Next.js のルート、レイアウト、API 接続
src/features/  auth、profile、works、各ツールの機能実装
src/shared/    複数機能で共有する UI、型、エラー、utility
src/database/  Drizzle の接続、スキーマ、マイグレーション実行
src/types/     DB・ライブラリ境界の補助型
drizzle/       生成された SQL マイグレーションとメタデータ
tests/unit/    src/ と同じ階層で配置する Bun テスト
tests/e2e/     Playwright E2E テスト
.agents/       AI エージェント向けの共有スキルと運用メモ
```

`src/app` はルーティングと機能の接続に留め、機能固有の画面・コンポーネント・ロジックは `src/features` に置きます。複数機能で実際に再利用するものだけを `src/shared` に置きます。

### テストの配置

テストは `tests/` にまとめ、Bun テストは `src/` 以下の階層を `tests/unit/` 以下に再現します。ファイル名は対象モジュールや検証する契約を表す `*.test.ts` とします。

```text
src/features/auth/client/loginCore.ts
tests/unit/features/auth/client/login.test.ts

src/features/tools/minesweeper/board.ts
tests/unit/features/tools/minesweeper/board.test.ts

src/shared/components/modal/dialogAccessibility.ts
tests/unit/shared/components/modal/dialogAccessibility.test.ts

tests/e2e/auth.e2e.ts
```

本番コードは `@/` から import し、テスト専用ヘルパーは利用するテストの近くに置いて相対 import します。E2E は `tests/e2e/` 以下に機能・フロー別の `*.e2e.ts` として配置します。

`mise run test` は `tests/unit/`、`mise run test:e2e` は `tests/e2e/` を対象にします。特定のテストだけを実行する場合は、次のようにパスを指定します。

```bash
mise exec -- bun test ./tests/unit/features/tools/minesweeper/board.test.ts
```

## 主な機能

- Better Auth とパスキーによる登録・ログイン・ログアウト
- プロフィールと制作物の表示
- 認証済みユーザー向けメモ帳
- クライアント内で処理する PDF 結合
- 論理解法を保証するマインスイーパー

## DB マイグレーション

スキーマ変更後はマイグレーションを生成し、SQL と `drizzle/meta` の差分を確認してから適用します。

```bash
mise run db:generate -- --name add_example_table
mise run db:migrate
```

共有済みのマイグレーションを後から書き換えず、修正は新しいマイグレーションとして追加してください。既存 DB の移行履歴補完には `src/database/migrate.ts` の互換処理があるため、適用前に対象 DB と生成 SQL を確認します。

## デプロイ

Drizzle の SQL マイグレーションは `drizzle` に保存されます。Dokploy と Nixpacks では、起動前にマイグレーションを適用します。

```text
NIXPACKS_START_CMD="bun run db:migrate && bun run start"
```

## デザインの調整

配色・書体・余白・動きの設定は `src/shared/styles/tokens.css` に集約しています。フォントの読み込みは `src/app/layout.tsx`、各画面の配置は feature ごとの CSS Module で調整します。設計方針と変更箇所は [デザインガイド](docs/design-system.md) を参照してください。

## 静的アセット

- Works のアセット URL は `NEXT_PUBLIC_ASSET_BASE_URL` を基準に解決します。
- この変数は開発・ビルド・本番環境で必須です。
- R2 などへ移行する場合は、安定したキー、キャッシュ設定、公開ドメイン、Next.js の画像最適化を確認してから `public/` の重複ファイルを削除します。

## AI 共有基盤

- [`AGENTS.md`](AGENTS.md): 常時適用するプロジェクト方針と専門スキルへの入口
- [`.agents/README.md`](.agents/README.md): 共有スキルの一覧と保守方法
- `.agents/skills/`: 実装領域ごとのリポジトリ共有スキル

スキルの詳細ルールは `AGENTS.md` に重複させず、責務を持つ `SKILL.md` で管理します。
