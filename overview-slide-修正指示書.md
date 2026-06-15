# 「数字で見る制度概要」(overview) スライド 修正指示書

対象動画方式: **hyperframes**（HTMLテンプレート方式）
対象シーン: **overview のみ**。hook / useCases / cta は一切変更しない。

修正ファイルは下記3つ:

- `nts-gate-lp/src/lib/video-hyperframes/buildVideoData.ts`
- `nts-gate-lp/src/lib/video-hyperframes/templates/subsidy-lp-video/script.js`
- `nts-gate-lp/src/lib/video-hyperframes/templates/subsidy-lp-video/style.css`

---

## 修正の狙い（3点）

1. **「残り○○日」バッジを削除する**
   動画生成した時点の残日数を表示しても、視聴時には古くなり誤解を招く。公募期限カードがあれば十分なので、残日数バッジ自体を撤去する。

2. **数字カードの正方形アイコン（円・率・カレンダー）を削除する**
   いかにもAIが付けた装飾アイコンに見えるため。アイコンブロックを消し、ラベルと数値だけのシンプルなカードにする。

3. **カード左端のカラー縦線を削除する**
   左端の縦アクセントバー（`.metric::before`）はAI生成物の典型的な記号。これを撤去する。

> 補足: 「対象: ◯◯」バッジ（緑）は残してよい。期限カード自体（公募期限の値）は残す。消すのは「残り○○日」の動的バッジのみ。

---

## 1. buildVideoData.ts の修正

### 1-1. metrics 配列から `icon` プロパティを削除

`metrics` 配列（`const metrics: HyperframesMetric[] = [ ... ]`）の各要素から `icon:` 行を削除する。`accent` は色分けに使うので残す。

修正後イメージ:

```ts
const metrics: HyperframesMetric[] = [
  {
    label: "補助上限",
    value: lpData.amountLabel,
    note: "枠・条件により異なる場合があります",
    accent: "amount",
  },
  {
    label: "補助率",
    value: lpData.rateLabel,
    note: "類型・要件により異なる場合があります",
    accent: "rate",
  },
  {
    label: "公募期限",
    value: lpData.deadlineLabel,
    note: lpData.remainingDays !== null ? "公募要領で確認が必要です" : "公募要領で確認が必要です",
    accent: "deadline",
  },
];
```

> note 欄に残日数を入れていた場合（`残り ${lpData.remainingDays} 日`）も廃止し、固定文言「公募要領で確認が必要です」などに統一する。残日数は note にも出さない。

### 1-2. overview シーンから `remainingDays` を削除

`scene({ id: "overview", ... })` の中の `remainingDays: lpData.remainingDays,` の行を削除する。`target`（対象者）と `alert`（公募要領で最終確認の注記）は残す。

### 1-3.（任意）型定義のクリーンアップ

`HyperframesScene` 型の `remainingDays?: number | null;` と、`HyperframesMetric` 型の `icon?: string;` は、他で使っていなければ削除してよい。残しても動作はするので、消すかどうかは任意。

---

## 2. script.js の修正

### 2-1. `renderOverview` から残日数バッジを削除

`renderOverview` 関数内の以下のブロックを削除する:

```js
const remaining = scene.remainingDays;
const remainingBadge =
  typeof remaining === "number" && remaining >= 0
    ? '<span class="pill pill-urgent">' + icon("bell") + "残り " + remaining + " 日</span>"
    : "";
```

そして `badges` を組み立てている箇所を、targetBadge だけにする:

```js
const badges = targetBadge
  ? '<div class="overview-badges reveal" style="--d:1">' + targetBadge + "</div>"
  : "";
```

（`+ remainingBadge` を消す）

### 2-2. 数字カードからアイコンを削除

`renderOverview` 内のカード生成部分から、`metric-icon` の span を削除する。

修正前:

```js
'<div class="metric-top">' +
'<span class="metric-icon">' + icon(metric.icon || "yen") + "</span>" +
'<span class="metric-label">' + esc(metric.label) + "</span>" +
"</div>" +
```

修正後（metric-top ごと無くし、ラベルを直接置く。または metric-top を残してアイコンだけ消す）:

```js
'<span class="metric-label">' + esc(metric.label) + "</span>" +
```

> `metric-top` の div を残すか消すかは下の CSS と合わせる。ここでは **metric-top を消してラベル単体にする**前提で書く。

### 2-3.（任意）他シーンのアイコンは触らない

- `target` バッジ（`icon("target")`）、CTAの `icon("check")`、hook の `icon("bell")` `icon("spark")` は**そのまま残す**。今回消すのは overview の数字カード内アイコンのみ。
- なお「対象:」バッジのアイコンもAI感が気になる場合は `icon("target") +` を消してテキストだけにしてよい（任意）。

---

## 3. style.css の修正

### 3-1. カード左端の縦線を削除

以下の4つのルールを削除する:

```css
.metric::before { content: ""; position: absolute; left: 0; top: 0; width: 6px; height: 100%; background: var(--blue); }
.metric.accent-amount::before { background: linear-gradient(180deg, var(--amber), var(--amber-deep)); }
.metric.accent-rate::before { background: linear-gradient(180deg, var(--cyan), var(--blue-deep)); }
.metric.accent-deadline::before { background: linear-gradient(180deg, var(--indigo), #3b4fd8); }
```

> `.metric { ... overflow: hidden; }` の `position: relative;` は他に影響しないので残してよい。

### 3-2. アイコン用スタイルを削除

以下のルールを削除する（アイコンを使わなくなるため）:

```css
.metric-icon { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; font-size: 26px; }
.accent-amount .metric-icon { background: rgba(245, 158, 11, 0.14); color: var(--amber-deep); }
.accent-rate .metric-icon { background: rgba(23, 164, 201, 0.14); color: var(--blue-deep); }
.accent-deadline .metric-icon { background: rgba(91, 111, 245, 0.14); color: var(--indigo); }
```

`.metric-top { ... }` は、script.js 側で metric-top を消す場合は削除。残す場合はそのまま。

### 3-3. カードの色分けを縦線なしでどう出すか（推奨）

縦線を消すと3枚が同じ見た目になる。色分けは残したいので、**数値の色**で差をつけるのを推奨（縦線・アイコンに頼らない、自然な配色）:

```css
/* 値の色で種別を区別する（縦線・アイコンの代替） */
.accent-amount .metric-value { color: var(--amber-deep); }   /* 既存。額はアンバー */
.accent-rate .metric-value   { color: var(--blue-deep); }    /* 率はブルー */
.accent-deadline .metric-value { color: var(--indigo); }     /* 期限はインディゴ */
```

> これだけで「ボックス＋色付き数値」のすっきりした見た目になる。どうしても物足りなければ、カード上辺に細い色帯（`border-top: 4px solid …`）を付ける案もあるが、縦線と同じくAI感が出やすいので**まずは数値の色分けのみ**を推奨。

---

## 4. 確認観点（実装後チェック）

- overview シーンに「残り○○日」が**表示されない**こと。
- 数字カードに正方形アイコンが**無い**こと。
- カード左端の縦線が**無い**こと。
- 補助上限・補助率・公募期限の3枚が、数値の色で区別できること。
- 「対象: ◯◯」バッジ・「※詳細は公式の公募要領で…」注記は残っていること。
- hook / useCases / cta シーンが**変わっていない**こと。
- 他補助金でも値が変数から自動で入ること（`amountLabel` / `rateLabel` / `deadlineLabel` / `targetArea`）。

---

## 5. 補足: ファイル編集時の注意

過去にエディタが大きいファイルの保存を途中で切る事象があった。保存後は必ず:

- `script.js` → `node --check script.js` で構文チェック
- `style.css` → `{` と `}` の数が一致するか確認
- `buildVideoData.ts` → `npx tsc --noEmit` で型チェック

を行い、ファイル末尾まで正しく書き込まれていることを確認すること。
