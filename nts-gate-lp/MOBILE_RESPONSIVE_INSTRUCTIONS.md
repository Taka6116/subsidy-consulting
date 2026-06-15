# Cursorへの指示書｜nts-gate-lp トップLP モバイル最適化（PC版は一切変更しない）

> このファイルをCursorに読み込ませ、「この指示書のルールに従ってモバイル版だけ整えて」と依頼してください。

---

## 0. 最重要の絶対ルール（必読・違反厳禁）

**PC版（デスクトップ表示）は完璧に完成している。1pxたりとも見た目を変えてはいけない。**

このプロジェクトは **モバイルファースト Tailwind** で書かれています。つまり：

- プレフィックスなしのクラス（例 `text-2xl` `px-4` `grid-cols-1`）= **モバイルの土台かつPCにも継承される**
- `md:` `lg:` `xl:` `2xl:` プレフィックス付き = **PC専用の上書き**

この構造のため、**既存のクラスを書き換えるとPCにも影響が出る**可能性が高い。
よって、モバイル修正は原則として以下の「上書き専用レイヤー」で行うこと。

### やってよいこと（許可）
- 新規CSSファイル `src/styles/mobile-overrides.css` を**新規作成**し、`@media (max-width: 767px)` の中でのみスタイルを当てる
- 既存の `globals.css` / `home-lp-depth.css` に**新しい `@media (max-width: 767px)` ブロックを追記**する
- JSXに **モバイル専用のクラスを追加**する（例：`className="... block md:hidden"` の追加、`max-md:` プレフィックスの追加）

### 絶対にやってはいけないこと（禁止）
- ❌ プレフィックスなしの既存クラスの値を変更する（例 `px-8` → `px-4` のような書き換え）
- ❌ `md:` `lg:` `xl:` `2xl:` で始まるクラスの追加・変更・削除
- ❌ `@media (min-width: ...)` のブロックの編集
- ❌ `@media (min-width: 769px) and (max-width: 1024px)` など769px以上を含むクエリの編集
- ❌ HeroSection（FV）系コンポーネントのレイアウト改変（後述の例外を除く）
- ❌ コンポーネントのロジック・データ取得・構造（DOM階層）の変更

---

## 1. ブレークポイントの定義（このプロジェクトの実態）

| 区分 | 幅 | 役割 |
|---|---|---|
| モバイル | 〜767px | **今回いじってよい唯一の領域** |
| タブレット | 768px〜1023px (`md:`) | PC寄り・触らない |
| デスクトップ | 1024px〜 (`lg:`) | PC・触らない |

Tailwindの標準ブレークポイント（`sm`=640px, `md`=768px, `lg`=1024px）を使用。
**モバイル専用上書きの境界は `max-width: 767px`** に統一すること（`md:`=768pxと衝突させないため）。

> 既存コードには `@media (max-width: 768px)` が散在しているが、新規追加分は **767px** を使い、768pxちょうど（タブレット最小幅）に影響させないこと。

---

## 2. 実装方針：上書き専用レイヤーを1枚作る

### ステップ1：新規ファイルを作成
`src/styles/mobile-overrides.css` を新規作成。

```css
/**
 * モバイル専用上書きレイヤー（〜767px のみ）
 * PC・タブレットには一切影響させないこと。
 * すべてのルールは @media (max-width: 767px) の内側に書く。
 * .home-lp 配下に限定してトップLP以外への波及を防ぐ。
 */
@media (max-width: 767px) {
  /* ここにモバイル修正を追記していく（セクション3参照） */
}
```

### ステップ2：globals.css の先頭で読み込む
`src/app/globals.css` の既存 import の直後に1行だけ追記：

```css
@import "../styles/home-lp-depth.css";
@import "../styles/mobile-overrides.css"; /* ← この1行のみ追加 */
```

> `@import` は `@tailwind utilities` より後に読み込まれる必要がある。既存の `home-lp-depth.css` import と同じ位置に並べれば順序は担保される。Tailwindのutilityに勝てない場合のみ、個別ルールに限り `!important` を許可する。

### ステップ3：すべての修正をこのファイル内で完結させる
JSX側の編集は最小限に。原則CSSだけで解決する。

---

## 3. モバイルでよくある崩れと、対処の型（テンプレ）

実機（375px幅 = iPhone SE/12 mini 相当、390px = iPhone 14）で確認しながら、**崩れている箇所だけ**を以下の型で直す。
※下記セレクタは例。実際のクラス名・要素は対象セクションを見て合わせること。

### 3-1. 横スクロール（最優先で潰す）
画面より広い要素が原因。まず犯人を特定：

```css
@media (max-width: 767px) {
  .home-lp { overflow-x: hidden; }
}
```

根本原因（固定px幅、`100vw`、はみ出すgrid、長い英数字）も個別に対処：
```css
@media (max-width: 767px) {
  .home-lp [class*="min-w-"] { min-width: 0; }      /* 必要箇所のみ */
  .home-lp .some-wide-table { display: block; overflow-x: auto; }
}
```

### 3-2. 多カラムグリッドが潰れて読めない → 1カラムへ
```css
@media (max-width: 767px) {
  .home-lp .target-grid { grid-template-columns: 1fr !important; }
}
```
（既存の `.two-col` は `@media (max-width:1024px)` で既に1カラム化済み。重複させない）

### 3-3. 文字が大きすぎ／はみ出す
見出しの `clamp()` はトークン側で効いているので原則触らない。
個別に大きすぎる場合のみ：
```css
@media (max-width: 767px) {
  .home-lp .oversized-heading { font-size: 1.5rem; line-height: 1.4; }
}
```

### 3-4. 余白（padding）が大きすぎて窮屈／間延び
左右パディングは20pxを基準（既存 `.section-inner` の値に合わせる）。
セクション縦余白が大きすぎる場合：
```css
@media (max-width: 767px) {
  .home-lp .section-block { padding-top: 56px; padding-bottom: 56px; }
}
```

### 3-5. ボタン／CTAが小さい・押しにくい
タップ領域は最低44px高さ。横幅は画面いっぱい近くに：
```css
@media (max-width: 767px) {
  .home-lp .cta-button { width: 100%; min-height: 48px; }
}
```

### 3-6. 画像・カードのはみ出し
```css
@media (max-width: 767px) {
  .home-lp img { max-width: 100%; height: auto; }
}
```

### 3-7. 横並びflexが折り返さない
```css
@media (max-width: 767px) {
  .home-lp .row-needs-wrap { flex-wrap: wrap; }
}
```

---

## 4. FV（HeroSection）の扱い ― 特に慎重に

`src/components/gate-lp/hero-three/`（HeroSection.tsx / .module.css / WebGL背景）はFVであり、最も触ってはいけない領域。

- WebGL背景・Three.js関連は**一切触らない**（パフォーマンス／レイアウトとも）
- どうしてもFVのモバイル文字サイズ等を直す場合は、`HeroSection.module.css` 内に **`@media (max-width: 767px)` ブロックを新規追記**するに留め、既存ルールは変更しない
- FV直後の `HeroPartnerStrip`（ロゴ帯）が横スクロール／潰れている場合は3-1・3-7の型で対処

---

## 5. 対象セクション一覧（トップLP / src/app/page.tsx の描画順）

各セクションを375px幅で順に確認し、崩れているものだけ直す。

1. `HeroSection`（FV）― §4の慎重ルール
2. `HeroPartnerStrip`（ロゴ帯）
3. `ArticlesCtaBar`（情報ハブ：記事・LP・動画）
4. `AwarenessSection`（課題共感）
5. `RootIssueCaseSection`（視点の違い）
6. `SubsidyExamplesSection`（制度例）
7. `SubsidyCaseStudySection`（事例）
8. `NtsAiGapSection`（AIギャップ）
9. `WhatIsNtsSection`（フロー説明）
10. `NtsWarmIntroMergedSection`（伴走統合）
11. `PartnerNarrowSection`（パートナー）
12. `SubsidyMatchCtaSection`（診断CTA）
13. `FaqSection`（FAQ）
14. `FinalCtaSection`（最終CTA）
15. `LpFooter`（フッター）

> `Header`（`src/components/shared/Header.tsx`）のモバイルメニュー（ハンバーガー）が崩れている場合もここで対処。ただしPC時のナビは触らない。

---

## 6. 作業フローと検証（必須）

1. `npm run dev` で起動
2. ブラウザのDevToolsでデバイスツールバーを開き、**幅375px** と **390px** で各セクションを上から確認
3. 崩れを発見 → §3の型で `mobile-overrides.css` に追記
4. **修正のたびに幅1024px・1280pxへ切り替え、PC版が完全に同一であることを目視確認**（ここが最重要チェック）
5. 横スクロールが出ていないか（画面を左右にドラッグして確認）
6. 全セクション完了後、`npm run build` が通ることを確認

### 完了の定義（Definition of Done）
- [ ] 375px / 390px で横スクロールなし
- [ ] 全セクションで文字・画像・カードがはみ出さず読める
- [ ] CTAボタンがタップしやすい（幅・高さ十分）
- [ ] **1024px以上のPC表示が修正前と完全に同一**（差分なし）
- [ ] 変更が `mobile-overrides.css`（＋必要最小限のJSXクラス追加）に集約されている
- [ ] `md:` `lg:` `xl:` クラスと `min-width` メディアクエリに変更が一切ない
- [ ] `npm run build` 成功

---

## 7. 変更してよいファイルのホワイトリスト

| ファイル | 許可範囲 |
|---|---|
| `src/styles/mobile-overrides.css` | 新規作成・全面的に記述可（`max-width:767px`内のみ） |
| `src/app/globals.css` | import 1行追加＋`@media (max-width:767px)`の新規ブロック追記のみ |
| `src/styles/home-lp-depth.css` | `@media (max-width:767px)`の新規ブロック追記のみ |
| 各セクション `.tsx` | モバイル専用クラスの**追加**のみ（既存クラスの変更・削除は禁止） |
| `hero-three/HeroSection.module.css` | `@media (max-width:767px)`の新規追記のみ（§4） |

**上記以外のファイル、特にPCレイアウトを決めるプレフィックス付きクラスとmin-widthクエリには触れないこと。**

---

## 8. 困ったときの判断基準

「この修正、PCに影響する？」と少しでも迷ったら：
- そのCSSルールを `@media (max-width: 767px)` で**必ず**囲む
- それでPCに影響することは原理上ありえない（768px以上には適用されないため）

これがこの指示書の安全装置です。**迷ったら max-width:767px で囲む。** これを徹底すればPC版は守られます。
