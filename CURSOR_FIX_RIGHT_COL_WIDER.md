# 修正指示: 右カラムのフォーム＋動画ボックスを横に広げる

## 対象ファイル

`nts-gate-lp/src/components/partner-lp/HeroSection.module.css` — このファイルだけ

---

## 現状

左テキストの2行レイアウトは完璧。しかし右カラムのフォーム＋動画ユニットが小さすぎて、動画が見えにくい。

---

## 方針

左テキストのカラム幅・フォントサイズは一切触らない。
右カラムだけを広げる。具体的には:
1. `scale()` を `0.94` → `1`（等倍）に戻す
2. 左カラムの `flex-basis` と `max-width` はそのまま
3. 右カラムの `flex-basis` を少し広げ、`flex-grow: 1` で左の残りスペースを全部取る

---

## 修正内容

### 修正箇所: ノートPC帯 `@media (min-width: 1024px) and (max-width: 1439px)` 内

#### `.content` — 変更なし（そのまま残す）
```css
.content {
  flex: 0 1 40%;
  width: auto;
  min-width: 0;
  max-width: 40%;
}
```

#### `.imgCol` — `flex-grow: 1` に変更して残りスペースを全部取る

Before:
```css
.imgCol {
  flex: 0 1 57%;
  width: auto;
  min-width: 0;
  max-width: 57%;
  transform: none;
  overflow: hidden;
}
```

After:
```css
.imgCol {
  flex: 1 1 57%;
  width: auto;
  min-width: 0;
  max-width: none;
  transform: none;
  overflow: hidden;
}
```

変更点: `flex: 0 1 57%` → `flex: 1 1 57%`（flex-growを1にして余白を吸収）、`max-width: 57%` → `max-width: none`（上限を解除）。

#### `.partnerFormVideoUnit` — scaleを外して等倍に戻す

Before:
```css
.partnerFormVideoUnit {
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: 0;
  zoom: 1;
  transform: scale(0.94);
  transform-origin: top right;
}
```

After:
```css
.partnerFormVideoUnit {
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: 0;
  zoom: 1;
  transform: none;
}
```

---

## やってはいけないこと

- `.content` のカラム幅やフォントサイズを変えない（左は完璧なので触らない）
- `.headlineLine` の `white-space: nowrap` を変えない
- TSXの変更は不要

## 確認方法

ブラウザの DevTools でウィンドウ幅を 1024px・1200px・1439px に設定し:
1. 左の見出しが2行のまま崩れていない
2. 右のフォーム＋動画ボックスが以前より横に広がっている
3. 動画プレビューが見えるサイズになっている
4. 左テキストと右ボックスが重なっていない
