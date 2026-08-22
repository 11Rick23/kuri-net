---
name: kuri-net-database-guideline
description: Use when kuri-net work touches PostgreSQL, Drizzle schemas, database connections, feature repositories, transactions, migration SQL or metadata, migration generation, migration application, or persisted user state.
---

# kuri-net Database Guideline

Drizzle の schema と migration history を永続化の正本として扱い、既存データと認証テーブルへの影響を先に確認する。

## 配置と責務

- 接続は `src/database/index.ts`、schema は `src/database/schema.ts`、適用処理は `src/database/migrate.ts` に置く。
- 機能固有の query は、既存の `src/features/<feature>/data/repository.ts` の形に合わせる。
- UI component、hook、client module から DB を直接操作しない。
- repository は表示や HTTP の都合を持ち込まず、必要な値か型付き data を返す。

## Query と更新

- `DATABASE_URL` を必須とし、接続 URL や query parameter に含まれる秘密値をログへ出さない。
- ユーザー所有データの key は server session から導出し、クライアント指定の user ID を信用しない。
- 複数 write が一つの状態遷移を構成する場合は transaction を使う。
- 更新・削除では対象条件を狭くし、必要に応じて更新件数や返却行を確認する。
- DB error は既存の `DatabaseError` 変換方針に合わせ、内部情報をそのままユーザーへ返さない。

## Schema と migration

- schema 変更後は `mise run db:generate -- --name <name>` で migration を生成する。
- 生成された SQL と `drizzle/meta` を確認し、意図した table、column、constraint、index、default だけが含まれることを確かめる。
- dev/main など共有履歴に入った migration は書き換えない。修正は現在の head から新しい migration を追加する。
- column の意味を黙って流用せず、既存データの変換、互換性、rollback 影響を検討する。
- `src/database/migrate.ts` には既存 DB の migration history を補完する互換処理がある。新規 schema を追加するだけの目的でこの処理を変更しない。
- bootstrap 判定や migration runner を変える場合は、部分初期化 DB を誤認しないことと pool 終了を確認する。

## 検証

- pure な validation / repository 境界は Bun テストで確認する。
- migration 生成後は差分をレビューし、検証用 DB に `mise run db:migrate` を適用する。
- 本番または共有 DB への適用は、このスキルを読んだことだけでは許可された扱いにしない。
- DB や認証変更の最終確認は `$kuri-net-auth-guideline` と `$kuri-net-test-guideline` も併用する。
