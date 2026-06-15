# 補助金解説スライド画質・品質改善 指示設計書（Cursor向け）

## 背景・目的

`scripts/heygen/generate-heygen-agent.ts` で生成しているスライド画像（pattern-A〜D、各 slide-1〜7 / slide-cta / thumbnail）について、`public/preview/pattern-A〜D` で確認したところ、**slide-cta（slide-7）の解像度が他スライドより明らかに低く、写真・QRコードが粗い**ことが分かった。

本番では補助金ごとに **A〜Dをランダムで割り当てる**運用のため、「どのパターンが当たっても」同等の高品質である必要がある。したがって対応は4パターン全てに共通する `generate-heygen-agent.ts` のコード側に対して行う（`public/preview` 配下の画像を個別に差し替える対応は不可）。

---

## 対象ファイル

- `scripts/heygen/generate-heygen-agent.ts`（スライドSVG生成・PNG化のメインロジック）
- `scripts/heygen/assets/nts-team.jpg`（CTAスライドのチーム写真）

---

## 修正項目

### 1. PNG出力解像度を2倍化する（最優先・全パターン共通の根本対応）

**現状の問題**

```ts
const W = 1280;
const H = 720;
...
async function svgToPng(svg: string, fontPath: string | null): Promise<Buffer> {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W },   // ← 1280pxでラスタライズ
    font: { ... },
  });
  return Buffer.from(resvg.render().asPng());
}
```

SVG自体はベクターなので文字や図形は1280px出力でも比較的綺麗だが、**スライド内に埋め込む画像（CTAスライドのチーム写真・QRコード）は1280px基準で配置されるため、表示サイズによって粗さが目立つ**。また将来的にLPやサムネイルで拡大表示される可能性を考えると、出力解像度自体を上げておくのが最も確実。

**対応**

`svgToPng` の `fitTo` を2倍解像度でレンダリングするように変更する。

```ts
const SCALE = 2; // 出力解像度倍率（1280x720 → 2560x1440）

async function svgToPng(svg: string, fontPath: string | null): Promise<Buffer> {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W * SCALE },
    font: {
      fontFiles: fontPath ? [fontPath] : [],
      loadSystemFonts: false,
      defaultFontFamily: FONT,
    },
  });
  return Buffer.from(resvg.render().asPng());
}
```

- SVG内の座標・サイズ指定（`viewBox="0 0 ${W} ${H}"`など）は変更不要。`fitTo.value` を上げるだけでResvgが全体を高解像度にラスタライズする。
- HeyGenの動画生成APIに渡す背景画像も2560x1440になるが、HeyGen側は1280x720にリサイズして使われるため画質劣化はなく、むしろ縮小時にシャープに見える（アンチエイリアス品質向上）。
- 出力ファイルサイズが増える（PNG 4倍程度）ため、`output/` ディレクトリの容量に注意。問題なければそのままでOK。

---

### 2. CTAスライド（slide6CTA）のチーム写真を高解像度化する

**現状の問題**

```ts
const photoPath = path.join(process.cwd(), "scripts", "heygen", "assets", "nts-team.jpg");
```

`nts-team.jpg` の実サイズは **960×721px**。CTAスライド上での表示枠は `PW=620 × PH=296`（1280幅基準）。項目1で出力解像度を2倍化すると表示枠は実質1240×592相当になり、960px幅の元画像では拡大表示されて粗くなる。

**対応**

- `nts-team.jpg` を **1600px幅以上**の高解像度版に差し替える（できれば1920px幅）。元写真の高解像度版があれば再書き出し、なければ自社サイトのオリジナル画像（`scripts/heygen/output/top-fv-img01〜03` 等、フルサイズのもの）から差し替えを検討。
- 差し替え後もファイル名は `nts-team.jpg` のまま、または変更する場合は読み込みパスを更新する。

---

### 3. QRコードの解像度・マージンを見直す

```ts
const qrDataUrl = await QRCode.toDataURL(d.siteUrl, {
  // 現状の width/margin オプションを確認
});
```

- `QRCode.toDataURL` の `width` オプションを **600px以上**に上げる（現状の表示サイズ300x300に対して2倍出力にすると荒くなるため）。
- `margin` オプションが小さすぎる/大きすぎる場合は `2` 程度に統一し、白枠とのバランスを確認する。

---

### 4. パターンA・B・Dのslide6CTAにもガラス調枠線・影の統一感を持たせる

パターンCのみ白背景＋枠線スタイルで、A/B/Dは共通のダーク背景テンプレートを使っているが、QRコード周りの装飾（`filter="url(#sh2)"` の影）がC/A・B・Dで微妙に異なる。4パターンとも以下を統一する：

- QRコードの白カード（`rect width="320" height="320"`）に **角丸22px + ドロップシャドウ** を必ず適用する。
- チーム写真のクリップ角丸（`rx="22"`）と、QRカードの角丸（`rx="20"`）を同じ値（`22`）に統一し、視覚的な一貫性を持たせる。

---

### 5. フォント埋め込みの確認（テキストのジャギー対策）

`svgToPng` には `fontFiles` でフォントパスを渡しているが、`fontPath` が `null` の場合 `loadSystemFonts: false` のままだと **フォールバックフォントで文字が表示されジャギーになる**リスクがある。

- `fontPath` が必ず解決されること（Noto Sans CJK JPのフォントファイルが `scripts/heygen` 配下、または指定パスに存在すること）をビルド/実行前にチェックするガードを追加する。
- 例：

```ts
if (!fontPath) {
  throw new Error("フォントファイルが見つかりません。Noto Sans CJK JP のパスを確認してください。");
}
```

---

## 検証方法

1. 修正後、以下を実行し dry-run でPNGを再生成する（4パターン分）：

```bash
npx tsx scripts/heygen/generate-heygen-agent.ts <subsidyId> --dry-run --pattern=A
npx tsx scripts/heygen/generate-heygen-agent.ts <subsidyId> --dry-run --pattern=B
npx tsx scripts/heygen/generate-heygen-agent.ts <subsidyId> --dry-run --pattern=C
npx tsx scripts/heygen/generate-heygen-agent.ts <subsidyId> --dry-run --pattern=D
```

2. `scripts/heygen/output/` に生成された `slide-7.png`（CTA）と `thumbnail.png` を開き、以下を目視確認：
   - チーム写真・QRコードの輪郭がシャープか（ぼやけ・ジャギーがないか）
   - 文字（特に小さい注釈テキスト）が滲んでいないか
   - 4パターンともQRコード周りの装飾（角丸・影）が統一されているか

3. 確認後、`public/preview/pattern-A〜D/` に該当ファイルをコピーして本番プレビューを更新する。

4. 可能であれば、生成したPNGをHeyGenにアップロードして実際の動画背景としての見え方も確認する（`--production` なしのdry-runで十分な場合は省略可）。

---

## 優先度まとめ

| # | 項目 | 優先度 | 影響範囲 |
|---|------|--------|----------|
| 1 | PNG出力を2倍解像度化 | 高 | 全パターン・全スライド |
| 2 | チーム写真の高解像度化 | 高 | 全パターンのCTAスライド |
| 3 | QRコード解像度UP | 中 | 全パターンのCTAスライド |
| 4 | CTAスライドの装飾統一 | 低 | 全パターンのCTAスライド |
| 5 | フォント埋め込みガード | 中 | 全パターン・全スライド |

項目1・2が解決すれば、報告した「CTAスライドの画質が低い」という問題はほぼ解消される見込み。項目3〜5は品質の一貫性・将来のリグレッション防止のための付加対応。
