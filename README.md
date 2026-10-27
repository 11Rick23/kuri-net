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

日本語と英字・数字の境目には、`src/app/globals.css` の `text-autospace` で余白を自動適用します。文字列自体には空白を追加しません。非対応ブラウザでは通常の文字間隔で表示します。

ページ遷移では、ヘッダーを固定したまま本文を0.6秒でクロスフェードします。履歴の戻る・進む操作では本文をフェードインさせ、ホームへ戻るときはロゴの導入演出を優先します。「動きを減らす」設定時は演出を省略し、View Transitions 非対応のブラウザでもリンク移動は通常どおり利用できます。遷移のスタイルは `src/shared/styles/pageTransitions.css` で調整できます。

ホームへのアクセス時は、白／黒の全画面背景でロゴを描画し、ヘッダーへ縮小・移動した後に背景をフェードさせます。描画と移動には加速・減速を付け、所要時間は約3.7秒です。時間の調整は `src/features/home/HomeIntroAnimation.tsx`、中央のロゴサイズは同名の CSS Module で行います。Tab／Escape キー、画面サイズ変更時は演出を終了し、「動きを減らす」設定や JavaScript 無効時は本文をすぐに表示します。

ホームの「こんにちは。」は、元の Zen Kaku Gothic New の字形を、ロゴ演出の終了後に約3秒かけて筆順に沿って表示します。筆順マスクと速度は `src/features/home/HandwrittenGreeting.tsx`、表示サイズは同名の CSS Module で調整できます。Tab／Escape キーや「動きを減らす」設定では完成した文字を表示し、JavaScript 無効時も文字を表示します。

プロフィールの最初の画面には、所属・連絡先をまとめた名刺を中央に表示します。名刺は上から手渡されるように登場し、自己紹介などの本文はスクロールした先に続きます。名刺はマウスのホバー位置に合わせて軽く傾き、余白をドラッグすると角度制限なく回転できます。反射は静止時にも淡く表示し、操作に滑らかに追従します。速くドラッグして離すと、その勢いで回転を続け、減速してから近い向きの表面へ戻ります。途中で掴み直すと回転を止めて操作できます。スマホでは横方向のドラッグを使え、縦スクロールとピンチズームも維持します。「動きを減らす」設定時は回転を無効にします。見た目は `src/features/profile/components/ProfileBusinessCard.module.css`、操作は `TiltableCard.tsx` で調整できます。

名刺の下には「初めまして、kuri-kuriと申します。」を見出しとして表示し、その下に時間軸を配置します。基本情報の表や画面上の「経歴」ラベルは表示しません。背景はライト・ダークとも無地です。

自己紹介の見出し・経歴・デバイスとアプリ一覧は、Worksと共通の `Reveal` を使い、スクロールで画面に入ると一度だけフェードインします。「動きを減らす」設定時や印刷時は演出を省略し、内容を表示します。

名刺の連絡先・経歴の本文リンク・アプリのリンクは、ホームと同じくホバーやキーボードフォーカスで背景と文字色を反転し、クリック時に背景が点滅します。内部ページへの移動と外部リンクの新しいタブ表示は、約0.28秒の点滅後に行います。Cmd／Ctrlキー付きクリックや中クリックはブラウザ標準の動作を維持し、「動きを減らす」設定時は点滅と待ち時間を省略します。

名刺以降の内容は最大760pxの共通幅で中央に配置し、経歴とデバイス・アプリ一覧の左右を揃えます。経歴は5つの時期に分け、時間軸の丸には年とその時点の年齢を表示します。選択した期間は黒い帯に年を大きく、月を小さく表示し、イベントはアイコン付きの縦線とカードで並べます。時期名のラベルは画面には表示しません。左右矢印キー・Home・Endでも時期を選択でき、狭い画面では時間軸を横にスクロールできます。

時間軸の丸は、ホバーやキーボードフォーカスで淡い背景が横に広がり、年の文字も同じ方向へわずかに横移動します。新しい時期へは左から塗りつぶして右へ抜け、過去へは右から塗りつぶして左へ抜けます。ホバーの方向は現在選択している時期との前後関係で決まり、選択と解除の濃い背景も丸の並びを進む方向に揃います。押している間は少し縮み、クリック時の点滅はありません。「動きを減らす」設定では移動やアニメーションを省略します。

時期の切り替えでは、カードの枠を横移動させず、見出しと本文を24pxの横移動・軽いぼかし・フェードで入れ替えます。約0.14秒かけて移動しながら消え、反対側から約0.21秒かけて移動しながら現れます。消えた文字は次の時期の描画まで透明なまま保ちます。新しい時期へ進むと左へ消えて右から現れ、過去へ戻ると方向が反転します。期間の黒い帯は背景を固定し、日付の文字だけを同じ方向に入れ替えます。連続操作では最後に選択した時期を表示し、「動きを減らす」設定や印刷時は演出を省略します。

イベントの本文は初めから表示し、要約を重ねて表示しません。本文が12行分を超えるカードだけ末尾をフェードさせ、矢印のクリックやキーボード操作で全文表示と折りたたみを切り替えます。本文リンクへフォーカスした場合も展開し、印刷時はすべての時期と全文を表示します。

経歴の下には「MY DEVICES」「MY APPS」のボックスを左右に並べ、600px未満では縦に配置します。15pxの汎用アイコンと14pxの名前を使い、用途が近い項目をまとめます。アプリは公式サイトへのリンク、詳細があるデバイスはボタンにします。デバイスのボタンはホバーやキーボードフォーカスで背景と文字色を反転し、詳細を開いている間も反転を維持します。クリック時の点滅や待ち時間はなく、詳細をすぐに開きます。詳細には値だけを表示し、内容に合う幅と小さな余白で縦に詰めます。項目ラベルと機器名は読み上げ用に残し、閉じるボタンは置きません。同じデバイスのボタン・Escapeキー・外側のクリックで閉じられ、ホバーやフォーカスも外れると背景がアニメーションしながら消えます。対応ブラウザでは詳細をデバイス名の右側で上下中央に揃え、約0.28秒で横に広がって表示し、閉じると縮みます。画面端では左側や上下へ切り替えます。「動きを減らす」設定では開閉アニメーションを省略します。タッチ操作時は行の高さを32px以上にします。

プロフィールの情報（名刺・デバイス・アプリ・時期とイベントの構成・詳細文章）は `src/features/profile/data/profileData.ts` に集約しています。経歴の期間は `start: { year: 2024, month: 4 }` と `end: "Current"` のように指定し、年月は数値、継続中は `"Current"` を使います。月は省略でき、指定する場合は1から12です。区切り線は期間表示の中央に固定します。各イベントには本文とリンクを直接定義します。表示は `components/ProfileStory.tsx`、時間軸の操作は `components/ProfileTimeline.tsx`、カードの表示と省略は `components/ProfileTimelineEventCard.tsx`、デバイスとアプリの表示は `components/ProfileEquipment.tsx` で管理します。

## 静的アセット

- Works のアセット URL は `NEXT_PUBLIC_ASSET_BASE_URL` を基準に解決します。
- この変数は開発・ビルド・本番環境で必須です。
- R2 などへ移行する場合は、安定したキー、キャッシュ設定、公開ドメイン、Next.js の画像最適化を確認してから `public/` の重複ファイルを削除します。

## AI 共有基盤

- [`AGENTS.md`](AGENTS.md): 常時適用するプロジェクト方針と専門スキルへの入口
- [`.agents/README.md`](.agents/README.md): 共有スキルの一覧と保守方法
- `.agents/skills/`: 実装領域ごとのリポジトリ共有スキル

スキルの詳細ルールは `AGENTS.md` に重複させず、責務を持つ `SKILL.md` で管理します。
