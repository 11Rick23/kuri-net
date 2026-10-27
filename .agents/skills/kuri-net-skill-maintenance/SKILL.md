---
name: kuri-net-skill-maintenance
description: Use when creating, renaming, deleting, validating, reorganizing, or reviewing kuri-net repository skills, AGENTS.md, .agents/README.md, agents/openai.yaml, skill routing, shared AI documentation, or conventions for areas where kuri-net has no established rule.
---

# kuri-net Skill Maintenance

通常の実装作業には使わず、共有 AI スキルまたは入口文書を変更するときに使う。

## 正本

- 共有スキルは `.agents/skills` に置く。
- `AGENTS.md` は常時読む共通方針と routing に限定する。
- `.agents/README.md` はチーム向けの責務一覧と保守方法に限定する。
- `README.md` は人間向けのセットアップ、構造、機能、コマンド、デプロイ情報を持つ。
- 実装手順と領域固有の判断は、それを所有する専門スキルに置く。

## 規則の優先順位

スキルに新しい判断基準を追加するときは、次の順で根拠を確認する。

1. ユーザーの明示要件と現在のタスク固有条件。
2. kuri-net のコード、設定、既存テスト、文書にある規則と確立したパターン。
3. kuri-net の専門スキルにある、同じ責務へ再利用できる判断基準。
4. 対象言語、フレームワーク、ライブラリの公式な推奨事項。

- kuri-net に既存規則がある配置、技術選定、命名、挙動は維持する。
- 未定義または曖昧な記述形式、ケース設計、保守手順などは、kuri-net 内で繰り返し利用できる一貫した規則として定める。
- 使用していない言語、フレームワーク、ドメイン固有の前提を持ち込まない。
- 一般的な推奨事項と kuri-net の既存規則が衝突する場合は既存規則を優先し、仕様判断が必要ならユーザーへ確認する。

## 保守手順

1. `AGENTS.md`、`.agents/README.md`、`README.md`、影響する `SKILL.md` を読む。
2. `rg` で古い skill 名、重複ルール、stale な prompt を探す。
3. 常時必要なルールか、チーム運用か、専門手順か、人間向け説明かを分類する。
4. kuri-net に規則がなければ、技術構成と既存方針に整合する再利用可能な判断基準を定める。
5. 重複 skill を作る前に、既存の責務へ狭く追加できるか確認する。
6. 一覧、routing、UI metadata、README のうち影響するものだけを同時更新する。

## Skill の形

- folder 名と `SKILL.md` の `name` を一致させ、lowercase hyphen-case にする。
- frontmatter は `name` と `description` に絞る。
- `description` に実際の trigger を含め、body を読まなくても選択できるようにする。
- Codex が一般知識で判断できる説明、実例の羅列、未確認の将来ルールを増やさない。
- conditional な長い手順がない限り、空の `references/`、`scripts/`、`assets/` を作らない。
- `agents/openai.yaml` の文字列は quote し、`default_prompt` に正しい `$skill-name` を含める。

## 検証

- 利用可能なら skill-creator の `quick_validate.py` を変更した各 folder に実行する。
- `SKILL.md` に TODO が残っていないこと、folder 名と name が一致することを確認する。
- 全 `agents/openai.yaml` の prompt と skill 名を照合する。
- `AGENTS.md` と `.agents/README.md` の一覧に追加・削除・改名が反映されていることを確認する。
- `README.md` を確認し、セットアップ・構造・workflow への影響がなければ無理に変更しない。
- `git status --short` で意図した共有ファイルだけが変更されたことを確認する。
