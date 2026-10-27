---
name: kuri-net-auth-guideline
description: Use when changing kuri-net Better Auth configuration, passkey registration or login, sessions, protected pages, Server Actions, user status, authorization, registration cleanup, auth schema, or auth E2E behavior.
---

# kuri-net Authentication Guideline

認証の成立と操作対象の認可を分け、保護された副作用の直前にサーバー側で両方を確認する。

## 正本と境界

- Better Auth 設定は `src/features/auth/server/auth.ts`、session 判定は `server/session.ts`、状態遷移は `server/actions.ts` を入口にする。
- browser 側の `client/` と `hooks/` は UX を担当し、認可の正本にしない。
- auth table は `src/database/schema.ts` と Drizzle migration で管理し、adapter の期待形を確認して変更する。
- API route `src/app/api/auth/[...all]/route.ts` は Better Auth handler の接続に留める。

## Session と認可

- 通常の保護機能は `getAuthenticatedSession()` を使い、`ACTIVE`、非匿名、profile 完了の既存 policy を通す。
- 登録途中の処理で `getRawSession()` が必要な場合は、`REGISTERING` と匿名状態など、その処理固有の state を DB で再確認する。
- client から user ID、role、登録状態を受け取って認可しない。操作対象の user ID は session から導出する。
- page guard や非表示 button だけに依存せず、Server Action / repository 呼び出し前に拒否する。
- 複数の auth table と user state を更新する完了処理・cleanup は transaction と整合性条件を保つ。

## Passkey と秘密情報

- passkey 登録・login の user verification 条件を弱めない。
- credential ID、public key、counter、user relation の unique / cascade 条件を schema と adapter の両方で確認する。
- `BETTER_AUTH_SECRET`、session token、credential、DB URL をログ、例外文、テスト fixture、文書へ記録しない。
- ユーザー向けエラーは内部状態を漏らさず、再試行や登録状態の理解に必要な情報だけを返す。

## テスト

- session 不在、不正な user state、他ユーザー ID の注入、passkey 不在、途中キャンセルで副作用が起きないことを確認する。
- module mock を使う unit test では、mock 登録後に対象 module を import する既存パターンを守る。
- E2E は loopback host の使い捨て DB と virtual authenticator を使う。非ローカル DB を対象にしない安全条件を維持する。
- auth schema や登録フロー変更では `$kuri-net-database-guideline` と `$kuri-net-test-guideline` を併用する。
