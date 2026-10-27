---
name: kuri-net-ui-guideline
description: Use when changing kuri-net visual design, layout, cards, panels, modals, navigation, buttons, colors, Catppuccin themes, responsive behavior, hover or focus states, or accessibility.
---

# kuri-net UI Guideline

既存の Catppuccin ベースのフラットな UI を保ち、装飾より情報階層と操作の明確さを優先する。

## デザイン基盤

- light は Latte、dark は Macchiato を使い、`ctp-*` token と `globals.css` の `app-*` semantic color を優先する。
- 背景は `crust`、`mantle`、`base`、`surface*` の層と border で区切る。shadow による立体表現を追加しない。
- accent は原則 `app-accent` / `ctp-blue`、成功・注意・エラーは定義済み semantic color を使う。
- corner は既存の `rounded-lg` と、icon button / badge の `rounded-full` を基本にする。
- hover、active、selected の違いを色・border・必要最小限の motion で表す。

## コンポーネントと配置

- `src/shared/components` と `src/features/tools/components` に既存部品があれば再利用する。
- page 幅は `PageContainer`、ツール画面は `ToolsPageFrame` / `ToolsShell` の既存構造を優先する。
- 同じ意味の button、modal、toast、badge を feature ごとに作り直さない。
- desktop だけで成立する固定幅を避け、狭い viewport で折り返し、overflow、操作領域を確認する。
- modal や overlay は z-index、背景操作、Escape、閉じる操作、scroll を一体として設計する。

## アクセシビリティ

- icon-only button には内容に合う `aria-label` を付ける。
- native button / link を使い、div click を通常の操作部品にしない。
- `:focus-visible` を消さず、hover だけに情報や操作を依存させない。
- loading、disabled、error、selected の状態を視覚だけでなく semantic attribute と文言でも伝える。
- 色の違いだけで意味を伝えず、text、icon、border などを組み合わせる。

## 検証

- `mise run lint`、`mise run typecheck`、対象テストを実行する。
- 実ブラウザで light/dark、狭い画面、keyboard focus、hover/active、modal/overlay を確認する。
- 視覚変更と機能変更を分けて説明し、確認していない端末やブラウザの結果を断定しない。
