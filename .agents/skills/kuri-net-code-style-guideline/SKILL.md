---
name: kuri-net-code-style-guideline
description: Use when editing kuri-net TypeScript, React, Next.js server or client code, imports, types, errors, formatting, Biome diagnostics, component boundaries, or Server Actions.
---

# kuri-net Code Style Guideline

TypeScript の strict 設定と Next.js の server/client 境界を保ち、実行時の安全性を型だけで代替しない。

## 基本スタイル

- `biome.json` を正本とし、タブ、ダブルクォート、セミコロン、trailing comma に合わせる。
- `@/*` alias を使い、feature 間の依存方向を読みやすくする。同じ小さなフォルダ内では相対 import も許容する。
- 型だけの import は `import type` を使う。
- `any`、不要な型 assertion、非 null assertion で境界問題を隠さない。
- コメントは「なぜ必要か」「どの制約を守るか」を説明する場合に限り、コードの逐語説明を避ける。

## React / Next.js

- Server Component を既定とし、state、effect、ブラウザ API、event handler が必要な境界だけに `"use client"` を置く。
- `"use server"` の処理では、入力型だけを信頼せず、認証・認可・値を実行時に検証する。
- route component は feature component や server function の接続に留める。
- client component へ秘密値、DB object、不要な server data を渡さない。
- effect には cleanup と依存配列を明示し、render 中に副作用を起こさない。

## 型とエラー

- 期待される分岐は既存の `Result<T, E>` が合う場合に利用し、例外との役割を混在させない。
- domain 入力エラーには `KuriNetError` 系、DB 境界には既存の DB error 変換を優先する。
- 外部ライブラリ・DB・ブラウザ API の値は境界で narrow する。
- `unknown` の error を扱う際は、ログや表示へ渡す前に安全な形へ変換する。

## 検証

- 変更中は `mise run lint` と `mise run typecheck` を実行する。
- フォーマット確認は `mise run format:check`、自動適用は意図した場合だけ `mise run format` を使う。
- server/client 境界や route を触った場合は `mise run build` まで確認する。
