# kuri-net Agent Skills

このディレクトリには、kuri-net のリポジトリ共有 Codex スキルを置きます。Git 管理することで、実装判断と検証手順をチームで共有します。

## 責務分担

- `AGENTS.md`: 常時読み込むプロジェクト共通方針とスキルへの入口。
- `.agents/README.md`: チーム向けのスキル一覧と保守方法。
- `kuri-net-skill-maintenance`: AI 向けの追加・改名・検証・整理手順。
- `kuri-net-*-guideline`: 実装領域ごとの専門ルール。
- `README.md`: 人間向けのセットアップ、構造、コマンド、機能、デプロイ情報。

詳細な専門ルールを `AGENTS.md` に複製せず、該当するスキルを正本にします。

## 規則の参照順

実装やスキルに判断基準がない場合は、次の順で規則を決めます。

1. ユーザーが明示した要件と現在のタスク固有条件。
2. kuri-net のコード、設定、テスト、文書にある既存規則と確立したパターン。
3. kuri-net の専門スキルにある、同じ責務へ再利用できる判断基準。
4. 使用中の言語、フレームワーク、ライブラリの公式な推奨事項。

既存規則で判断できない場合は、kuri-net の技術構成と責務境界に適合する規則を決め、該当する専門スキルへ記録します。

## スキル一覧

| スキル | 対象 |
| --- | --- |
| `kuri-net-structure-guideline` | プロジェクト構造、配置、責務境界 |
| `kuri-net-code-style-guideline` | TypeScript、React、Next.js、Biome、server/client 境界 |
| `kuri-net-ui-guideline` | Catppuccin、コンポーネント、レスポンシブ、アクセシビリティ |
| `kuri-net-database-guideline` | PostgreSQL、Drizzle、リポジトリ、マイグレーション |
| `kuri-net-auth-guideline` | Better Auth、パスキー、セッション、認可、保護された処理 |
| `kuri-net-test-guideline` | tests/ への分離配置、要件コメント、Given-When-Then、ケース設計、Bun・Playwright検証 |
| `kuri-net-runtime-guideline` | Bun、mise、環境変数、起動、DB、検証コマンド |
| `kuri-net-skill-maintenance` | 共有スキルと AI 文書の保守 |

## チーム運用

- 通常作業は `AGENTS.md` から開始し、対象領域のスキルだけを読みます。
- `.agents/skills` を共有スキルの正本とし、同名の個人スキルを重複して有効にしません。
- 複数領域にまたがる変更では、該当するスキルを併用します。
- セットアップ、構造、コマンド、機能一覧、デプロイに影響する場合は `README.md` も更新します。
- kuri-net に規則がない要素は、技術構成と既存方針に整合する判断基準を定め、専門スキルへ取り込みます。

## スキルの更新

- 重複する新規スキルを増やす前に、既存スキルの責務へ追加できるか確認します。
- スキルフォルダ名と `SKILL.md` の `name` を一致させます。
- `description` だけで適用条件が判断できるようにします。
- `agents/openai.yaml` の `default_prompt` には正しい `$skill-name` を含めます。
- スキルの追加・改名・削除・責務変更時は、この一覧、`AGENTS.md`、`kuri-net-skill-maintenance` を確認します。
- `quick_validate.py` が利用できる場合は、変更した各スキルへ実行します。
