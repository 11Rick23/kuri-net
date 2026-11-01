# AIエージェント判定実験

`/apps/ai-detector` はRFC 9421のHTTP署名をサーバーで検証し、同じURLに対して異なるHTMLを返します。署名なしのアクセスが人間であることは証明しません。無害な識別・表示実験用であり、ログインやアクセス制御の代替にはしません。

## 表示と判定

| 状態 | 表示 | X-Content-Variant |
| --- | --- | --- |
| `verified_openai` | あなたはChatGPTです | `verified-openai` |
| `verified_test_agent` | あなたはテストエージェントです | `verified-test-agent` |
| `unsigned` | あなたは誰でしょう？ | `public` |
| `invalid_signature` | アクセス元を確認できませんでした | `public` |
| `unknown_signer` | アクセス元を確認できませんでした | `public` |
| `verification_error` | 署名を検証できませんでした | `public` |

確認済みの表示は暗号検証と適用ポリシーの通過後だけ返します。別の状態のHTMLを同梱してJavaScriptやCSSで隠す方式ではありません。画面自体はJavaScriptなしで動作します。Apps一覧とアプリメニューからは通常のHTML遷移で開き、Next.jsのプリフェッチ・RSC・クライアントルーターによる結果再利用を避けます。

一般向けは青、OpenAI検証成功はオレンジ、ローカルテスト検証成功は緑です。既存のCatppuccin Latte / Macchiatoの色を使い、OSの配色設定に追従します。結果の大きな文字と余白を主役にし、技術情報は折りたたみます。画面内の文字はシステムフォント、識別子だけ等幅フォントを使います。画像・第三者スクリプト・アニメーションは使いません。

## 仕様とライブラリ

調査日: 2026-11-01。

- [RFC 9421](https://www.rfc-editor.org/rfc/rfc9421.html): 署名ベース、HTTPコンポーネント、Signature / Signature-Input。
- [draft-ietf-webbotauth-httpsig-protocol-01](https://datatracker.ietf.org/doc/html/draft-ietf-webbotauth-httpsig-protocol-01): 自動アクセスの署名。確定したRFCではありません。
- [OpenAI Cloud Browser allowlisting](https://help.openai.com/en/articles/11845367-chatgpt-works-cloud-browser-allowlisting): `Signature-Agent: "https://chatgpt.com"` と公開鍵の案内。
- [Cloudflare web-bot-auth](https://github.com/cloudflare/web-bot-auth): `http-message-sig@0.3.0` でRFC署名ベース構築・検証、`web-bot-auth@0.2.0` のcryptoアダプターでEd25519 JWKの読み込みと鍵指紋計算を行います。
- `structured-headers@2.0.3`: Structured Fieldsの解析・メタデータ表示。

依存パッケージは固定し、解決結果をbun.lockに記録しています。Cloudflare実装は未監査と明記されており、RFCの全機能を実装しているわけではありません。`sf` / `bs` / `tr` / `@query-param` など未対応の署名対象は確認済みにせず拒否します。

最新ドラフトとOpenAIの公開形式には差があります。文字列形式のSignature-Agentと、署名ラベルに対応する辞書形式の両方を受け付けます。辞書メンバーにパラメーターがある場合は採用しません。署名検証前に受信ヘッダーを別形式へ変換しません。最新ドラフトへの全面準拠を主張するものではありません。

## 検証の流れ

1. 署名関連ヘッダーがすべてなければ `unsigned`、一部だけ・不正な構造なら `invalid_signature` にします。各値は8,192文字、署名は4件、各署名対象は16件までです。
2. Signature-InputとSignature-Agentを構造化フィールドとして解析し、署名ラベルと署名主体を対応づけます。信頼する主体は `https://chatgpt.com` とその固定ディレクトリURLだけです。
3. 対象の署名がSignature-Agent自身と、`@authority` または `@target-uri` を含むことを要求します。署名ラベルの違う主体へ帰属させません。
4. `created` / `expires` / `keyid` / `tag="web-bot-auth"` を要求します。有効期間と最大経過時間は24時間、時計の許容差は30秒です。`alg` は省略可能ですが、あれば鍵と一致しなければなりません。受け付ける暗号方式はEd25519だけです。
5. 固定HTTPSディレクトリから公開鍵を取得します。タイムアウト3秒、リダイレクト禁止、最大64KiB、最大32鍵、キャッシュ5分、未知鍵による再取得は30秒間隔、取得失敗後は15秒待機します。並行取得は共有します。期限切れキャッシュの更新失敗時に古い鍵で検証を続けません。
6. `keyid` をJWKの `kid` と照合し、さらにJWKのSHA-256指紋との一致も確認します。鍵の `nbf` / `exp` があれば、アクセスごとに利用可能時刻を確認します。
7. ライブラリで署名を検証します。署名対象、パラメーター、署名ベースの独自暗号実装はしません。
8. nonceがあれば、検証後に署名主体・鍵ID・nonceのハッシュを記録して重複を拒否します。nonceのない署名は互換性のため受け入れますが、`replayProtection: unavailable` と表示・記録します。
9. 結果をHTMLとログへ反映します。常に `Cache-Control: private, no-store, max-age=0` を返します。

公開鍵や署名が検証できないときは、一般向けHTMLを返します。Signature-AgentやUser-Agentの文字列一致だけでは確認済みにしません。未知の主体のURL、リクエストに書かれた鍵取得先、任意のkeyid URLは取得しません。

## リプレイと署名範囲の制約

- nonceキャッシュは1プロセスのメモリ内に最大10,000件です。有効期間と許容時差が終わるまで保持し、満杯なら `verification_error` にします。
- 再起動、複数プロセス、複数インスタンスをまたぐ再利用は検出できません。必要なら共有ストアの不可分な登録処理へ変更する必要があります。
- nonceがない署名には期限チェックだけを適用します。署名が期限内に再利用されていないことは証明できません。
- 正規クライアントが同じnonceを繰り返し送る場合も拒否します。実Cloud Browserの挙動を観測し、研究上の採用条件を決めてください。
- `@authority` だけが保護されている署名は、同じホスト内のパス変更でも暗号検証が通ります。テストでこの限界も確認します。
- 署名の真正性と「今このリクエストを送ったのが誰か」の保証範囲は同一ではありません。署名の取得・転送・再利用可能性を含めて結果を解釈してください。

## ログ

標準出力へ1アクセス1行のJSONを記録します。イベント名は `ai_agent_detection` です。日時、リクエストID、メソッド、パス、User-Agent、Signature-Agent、解析済み署名メタデータ、成否、理由、配信種類が含まれます。

- `signatures[].authenticated` はその署名の暗号検証の成否です。nonce再利用などでアクセス自体を拒否する場合は、これがtrueでも全体の `status` は `invalid_signature` になります。
- 成功前のメタデータは送信側の申告値です。`alg` 省略時は成功後に鍵の方式を記録します。
- Signatureの値、nonceの値、秘密鍵、Cookie、Authorization、クエリはログに含めません。User-AgentとSignature-Agentは256文字、パスは512文字までです。
- ログの公開APIや管理画面は設けません。ログの保存期間と閲覧権限はデプロイ先で管理してください。
- [sample.jsonl](ai-detector/sample.jsonl) はローカル実験の記録例です。本物のOpenAI署名の記録ではありません。

## ローカル実行

通常はKuri-netのセットアップ後に `mise run dev` を実行し、[判定ページ](http://localhost:3000/apps/ai-detector) を開きます。署名なしでは一般向け表示になります。

署名検証の独立した実験環境はDBなしで実行できます。

```bash
# HTTPサーバーと署名クライアントを起動して6ケースを確認し、終了する
mise exec -- bun scripts/ai-detector/client.ts

# ブラウザで見るため、127.0.0.1:3001でテスト用サーバーを起動する
mise exec -- bun scripts/ai-detector/server.ts

# ユニットテスト
mise exec -- bun test tests/unit/features/tools/ai-detector
```

テスト用鍵は起動ごとに生成してメモリだけに保持します。署名クライアントはテスト用サーバーを起動し、署名したHTTPリクエストを実際に送信します。ローカルサーバーの `/.well-known/http-message-signatures-directory` はその起動時の公開鍵を返します。`.invalid` の識別子はローカル設定でその鍵へ対応づけており、外部への問い合わせはしません。

本番ルートはテスト用主体を登録していません。テスト設定を有効にする環境変数、テスト鍵の投入API、本番から署名を生成する機能はありません。

## Docker Compose

既存のDockerfileを利用し、Kuri-netと実験専用PostgreSQLを起動します。appポートはループバックにだけ公開し、DBポートは公開しません。

```bash
export POSTGRES_PASSWORD="$(openssl rand -hex 24)"
export BETTER_AUTH_SECRET="$(openssl rand -hex 32)"
docker compose up --build
```

[http://localhost:3000/apps/ai-detector](http://localhost:3000/apps/ai-detector) を開きます。Composeが作るDBは既存の開発・本番DBとは別です。停止は `docker compose down` で行います。DBボリュームは残るため、再起動時も同じパスワードを使用してください。`NEXT_PUBLIC_ASSET_BASE_URL` の既定値は画像不要の実験用です。Worksなどの表示には実際のアセットURLをビルド時に設定します。

## HTTPSでの実証

1. 既存のGHCR / Dokploy手順で対象バージョンをHTTPS公開します。この実装作業自体はデプロイや本番設定を変更しません。
2. `AI_DETECTOR_PUBLIC_ORIGIN` にブラウザがアクセスする公開originを設定します。例: `https://kuri-kuri.net`。省略時は `BETTER_AUTH_URL` を使います。パス・クエリ・資格情報は指定できません。HTTPはループバックだけ許可します。
3. プロキシ・CDNで実験URLをキャッシュ対象外にし、Signature / Signature-Input / Signature-Agentを保持します。外部から注入されたForwarded系ヘッダーをプロキシが適切に除去・上書きするよう設定します。
4. アプリは転送ヘッダーを公開originの情報源にせず、設定済みoriginと受信パス・クエリから署名検証用URLを構築します。パスの書き換え、クエリ並べ替え、スラッシュ補正、署名対象ヘッダーの変更があると検証に失敗し得ます。署名前と同じ情報をアプリまで届けてください。
5. 通常ブラウザで同じURLを開き、青のPUBLIC VERSIONを確認します。curlでもHTMLと `X-Content-Variant: public` を確認します。
6. ChatGPT Workで「Cloud Browserを使ってこのURLを開き、表示された判定結果を報告してください」と依頼します。検索機能や別の接続ツールによる取得をCloud Browserのアクセスとして扱わないでください。
7. サーバーログの時刻・リクエストID・署名対象・理由を確認します。`verified_openai` と `X-Content-Variant: verified-openai` が揃った場合だけ本物の署名の実証成功とします。
8. 署名ヘッダーが来ない、未対応コンポーネントがある、署名が期限切れ、プロキシで情報が変わる等の結果も記録します。成功と仮定しないでください。

ログの全ヘッダー保存や本物の署名の持ち出しは避け、比較にはリクエストIDと安全なメタデータを使います。公開IP一覧やUser-Agentは補助情報であり認証条件にはしません。

実証記録には [結果テンプレート](ai-detector/results-template.md) を使ってください。ChatGPT検索、Codex、他社のエージェントが同じ署名を送るとは仮定していません。
