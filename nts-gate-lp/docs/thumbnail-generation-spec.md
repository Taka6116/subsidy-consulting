# カードグリッド用サムネイル自動生成 指示設計書（Cursor向け）

## 背景・目的

`/subsidies/videos` の一覧ページ（`SubsidiesVideosIndex.tsx`）では、各補助金動画がカード形式で表示され、`video.thumbnailPath` の画像がカードのアイキャッチとして使われている。

現状の生成フローを確認した結果：

- 標準パイプライン（`runVideoJob.ts` 内、通常生成）では、サムネイルとして**スライド1（イントロスライド）のPNGをそのまま流用**している（`fallbackThumbnailPath = pngPaths[0]`、`composed.thumbnailPath` が無い場合のフォールバック）。
- 「enhanced（ニュース風）」プロバイダーの場合のみ、`composeVideo.ts` 内で専用のタイトルフレーム（`newsBackgroundSvg` + `newsOverlaySvg`）を合成してサムネイルにしている。
- `generate-heygen-agent.ts` には既に `thumbnailSvg(d, ff, t)` という、パターンA〜D向けの一覧カード用レイアウト関数（金額チップ・タグなど）が存在するが、これは `public/preview/pattern-X/thumbnail.png` のプレビュー生成にのみ使われており、**実際の動画生成パイプライン（`runVideoJob.ts`）からは呼ばれていない**。

つまり、本番で配信されているサムネイルの多くは「スライド1の流用」であり、`thumbnailSvg` が持つ専用デザイン（クリックしたくなるレイアウト）が活かされていない。

**やりたいこと**：動画生成と同時に、`generate-heygen-agent.ts` の `thumbnailSvg`（A〜Dテーマ対応・カード用専用レイアウト）を必ず呼び出し、その補助金の名称・金額・タグ等を反映した専用サムネイルPNGを生成し、`thumbnailPath` としてDBに保存・S3にアップロードする。スライド1の流用は廃止する。

---

## 対象ファイル

- `scripts/heygen/generate-heygen-agent.ts`（`thumbnailSvg` 関数、`pickTheme`、`svgToPng`）
- `src/lib/content/runVideoJob.ts`（動画生成のメインオーケストレーション。ここから `thumbnailSvg` を呼ぶ経路を追加）
- `src/lib/video/composeVideo.ts`（`composeEnhancedVideo` のサムネイル生成箇所。enhanced版も統一する場合に修正）
- `prisma/schema.prisma`（`GeneratedContent.thumbnailPath` — 変更不要、確認のみ）
- `src/app/subsidies/videos/SubsidiesVideosIndex.tsx`（カード側の表示。画像サイズ・aspect-video前提を確認）

---

## 実装方針

### 1. `thumbnailSvg` をモジュールとして再利用可能にする

`generate-heygen-agent.ts` はCLIスクリプトとして書かれているため、`thumbnailSvg` / `pickTheme` / `svgToPng` / `THEMES` をエクスポートし、`runVideoJob.ts` からインポートして呼び出せるようにする。

```ts
// scripts/heygen/generate-heygen-agent.ts の末尾付近に追加
export { thumbnailSvg, pickTheme, svgToPng, THEMES, type SlideData, type SlideTheme };
```

すでに `export` されている場合はそのままでよいが、`function` 宣言のみで `export` が付いていない場合は追加する。

### 2. `runVideoJob.ts` でサムネイル専用PNGを生成する

「スライドPNG生成」のステップ（`\ ── Step 3: スライドPNG 生成` 付近、550行目前後）で、スライド1〜7の生成に加えて、**`thumbnailSvg` を使った専用サムネイルSVG→PNGも1枚生成**する。

```ts
import { thumbnailSvg, pickTheme, svgToPng } from "@/../scripts/heygen/generate-heygen-agent";
// ※ パスはプロジェクトのtsconfigパス設定に合わせて調整

// ... pngPaths生成ループの後（または並行）に追加 ───────────────
const theme = pickTheme(subsidyId); // ランダム割り当てロジックは pickTheme 側に集約（後述）
const thumbSvg = thumbnailSvg(slideData, fontPath, theme);
const thumbnailDedicatedPath = path.join(workDir, "thumbnail-card.png");
await fs.writeFile(thumbnailDedicatedPath, await svgToPng(thumbSvg, fontPath));
```

`slideData`（`SlideData` 型）は、既存のスライド生成で使っている `d`（補助金名・金額・タグ等を含むオブジェクト）をそのまま渡す。新規に組み立てる必要はない。

### 3. フォールバックの差し替え

```ts
// 変更前
const fallbackThumbnailPath = pngPaths[0];

// 変更後
const fallbackThumbnailPath = thumbnailDedicatedPath;
```

これにより、`composed.thumbnailPath` が存在しない通常ケースでも、スライド1ではなく専用サムネイルがアップロードされる。

### 4. enhanced（ニュース風）版の統一

`composeVideo.ts` の `composeEnhancedVideo` 内、`thumbnailPath` 生成箇所（709-713行目）も同様に `thumbnailSvg` ベースに統一するか、現状の `newsOverlaySvg` ベースの専用タイトルフレームを維持するかは運用方針次第。

- **統一する場合**：`composeEnhancedVideo` の呼び出し元（`runVideoJob.ts`）で `thumbnailDedicatedPath` を渡し、`composeVideo.ts` 側では受け取ったパスをそのまま `thumbnailPath` として返すように変更する。
- **維持する場合**：enhanced版はニュース風サムネイル、標準版は `thumbnailSvg` ベースサムネイル、と2種類が併存する形になる。デザインの一貫性を重視するなら統一を推奨。

---

## クリック率を高めるためのサムネイルデザイン要件（`thumbnailSvg` 改修）

`thumbnailSvg` は既にA〜D4パターンの専用レイアウトを持っているが、「カードに小さく表示される」「ユーザーが動画だと分かってクリックしたくなる」という観点で以下を追加・確認する。

### 5. 再生ボタン（プレイアイコン）オーバーレイの追加

現状の `thumbnailSvg` には再生ボタンが含まれていない可能性がある。**全パターン共通の再生ボタンを中央または右下に重ねる**処理を `thumbnailSvg` の戻り値SVGに追加する。

```ts
// thumbnailSvg内、</svg>直前に共通パーツとして挿入
const playButton = `
  <g opacity="0.92">
    <circle cx="${W - 90}" cy="${H - 90}" r="44" fill="rgba(0,0,0,0.45)"/>
    <path d="M${W - 105} ${H - 110} L${W - 105} ${H - 70} L${W - 65} ${H - 90} Z" fill="#ffffff"/>
  </g>
`;
```

座標はカード内での視認性を見て調整（例: 右下隅から80〜100px内側）。

### 6. テキスト量を絞り、文字サイズを大きくする

サムネイルはカード表示時に小さく縮小される（`SubsidiesVideosIndex.tsx` で `aspect-video` のカードグリッド）。`thumbnailSvg` 内のテキストは：

- 補助金名は **最大2行・各行20文字程度**に収まるよう `slice`/折り返しロジックを確認する。
- 金額（`最大◯◯万円`）は最重要情報として**最大フォントサイズ**で表示する（既存の `chipW` 計算ロジックは維持）。
- 小さい注釈テキスト（対象業種・期限など）はサムネイルでは省略し、カードの下部テキスト要素（`SubsidiesVideosIndex.tsx` 側のタイトル・タグ表示）に任せる。

### 7. 4パターン共通で「動画である」ことが視覚的に伝わるバッジ

`thumbnailSvg` の4分岐（A/B/C/D）すべてに、左上または右上に **「動画で解説」「1分解説」等の小バッジ**を配置する。バッジのスタイルはテーマカラー（`THEMES[t.id]`）に合わせつつ、配置位置・サイズは4パターンで統一する。

---

## ランダムパターン割り当てとの整合性

サムネイルは `pickTheme(subsidyId)` で決まるテーマを使用するため、[slide-quality-improvement-spec.md](./slide-quality-improvement-spec.md) で対応する「ランダムA〜D割り当て」のロジックがどこに実装されるかに依存する。

- `pickTheme` 内で乱数（または `subsidyId` のハッシュ）によりA〜Dを決定している場合、**スライド生成時に決定したテーマと、サムネイル生成時に決定するテーマが必ず一致するようにする**（同一リクエスト内で `pickTheme` を1回だけ呼び、その結果をスライド・サムネイル両方に渡す）。
- 1回の動画生成内でスライドとサムネイルのテーマが食い違うと、カードのデザインと動画内デザインが不一致になり違和感が出るため要注意。

---

## 既存データの再生成

実装後、既存の `GeneratedContent`（`thumbnailPath` がスライド1流用になっている過去レコード）を一括再生成する必要がある。

```bash
# fix-missing-thumbnails.ts を参考に、force再生成スクリプトを作成
npx tsx scripts/regenerate-card-thumbnails.ts
```

- `scripts/fix-missing-thumbnails.ts` は `thumbnailPath: null` のレコードのみ対象にしているため、これをコピーして **全件 or 一定期間内の公開済みレコード**を対象にした新スクリプト（例: `regenerate-card-thumbnails.ts`）を作成し、`runVideoJob({ subsidyId, force: true })` または専用の「サムネイルのみ再生成」関数を呼ぶ。
- DB件数が多い（15分ごとクロールで継続的に増加）ため、レート制限・処理時間を考慮してバッチ実行（例: 1回50件ずつ）にする。

---

## 検証方法

1. 任意の `subsidyId` で `runVideoJob` をdry-run実行し、`thumbnail-card.png` が生成されることを確認。
2. 生成されたサムネイルを開き、以下を目視確認：
   - 補助金名・金額が小さい表示サイズでも読めるか
   - 再生ボタンが表示され、動画であることが分かるか
   - A〜D全パターンでバッジ位置・再生ボタン位置が統一されているか
3. `/subsidies/videos` をローカルで開き、カードグリッド上での見え方（縮小表示時の視認性）を確認。
4. 既存レコードへの再生成バッチを少数（5件程度）で試験実行し、DBの `thumbnailPath` とS3上の画像が更新されることを確認。

---

## 優先度まとめ

| # | 項目 | 優先度 | 影響範囲 |
|---|------|--------|----------|
| 1 | `thumbnailSvg` のエクスポート・`runVideoJob`からの呼び出し | 高 | 全新規生成動画 |
| 2 | フォールバックをスライド1→専用サムネイルに変更 | 高 | 全新規生成動画 |
| 3 | 再生ボタンオーバーレイ追加 | 高 | 全パターン |
| 4 | テキスト量調整（縮小表示対応） | 中 | 全パターン |
| 5 | 「動画で解説」バッジ追加 | 中 | 全パターン |
| 6 | enhanced版との統一 | 低〜中 | enhanced動画のみ |
| 7 | 既存レコードの一括再生成 | 中（実装後に対応） | 既存全件 |
