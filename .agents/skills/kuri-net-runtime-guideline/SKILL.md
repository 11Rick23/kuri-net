---
name: kuri-net-runtime-guideline
description: Use when running or changing kuri-net Bun, Node.js, mise tasks, dependency installation, local environment variables, development or production startup, builds, database commands, verification commands, or CI alignment.
---

# kuri-net Runtime Guideline

ローカル作業では `mise` をタスク入口、Bun を依存関係・script・unit test の実行基盤として扱う。

## ツールと設定

- tool version と task は `mise.toml`、package script と依存関係は `package.json`、解決済み依存関係は `bun.lock` を正本にする。
- 共有可能な環境変数の形は `mise.local.toml.example`、実値は Git 管理外の `mise.local.toml` に置く。
- `mise.local.toml` の値を表示・コピー・commit しない。必要な場合も key の存在だけを確認する。
- 依存関係を変更した場合は `bun.lock` を同じ変更で更新する。

## 共通タスク

- `mise run install`: `bun install --frozen-lockfile`。
- `mise run dev`: 環境変数を確認して Next.js 開発サーバーを起動。
- `mise run build`: 環境変数を確認して本番ビルド。
- `mise run start`: 作成済みの本番ビルドを起動。
- `mise run test`: Bun unit test。
- `mise run test:e2e`: 実行中のアプリと loopback DB に対する Playwright。
- `mise run lint`: Biome lint。ファイルを書き換えない。
- `mise run format`: Biome formatter。ファイルを書き換える。
- `mise run format:check`: formatter の差分確認。
- `mise run typecheck`: `tsc --noEmit`。
- `mise run db:generate -- --name <name>`: Drizzle migration 生成。
- `mise run db:migrate`: migration 適用。
- `mise run check`: format、lint、型、unit test、本番 build の一括確認。E2E は含まない。

## 実行時の注意

- `dev`、`build`、`start` は4つの app 環境変数、DB task は `DATABASE_URL` を要求する。
- `start` は build を自動生成しない。未作成または古い build なら先に `mise run build` を使う。
- `test:e2e` は Chrome、起動中アプリ、migration 適用済みの使い捨て DB が必要で、通常 check から分離する。
- migration の本番・共有 DB 適用や外部デプロイは、task が存在することだけでは許可された扱いにしない。
- セットアップ、task、環境変数、CI の手順を変えたら `README.md`、`mise.toml`、`package.json`、CI の対応を確認する。

## 検証の進め方

- 反復中は変更領域に近い task を実行する。
- 通常は最後に `mise run check` を実行する。
- CI では secret を使わない検証値を明示し、format、lint、型、unit test、build を個別 step で確認する。
