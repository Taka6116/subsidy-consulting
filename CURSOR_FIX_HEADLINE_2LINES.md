# 修正指示: 見出しを2行に収め、右フォームを縮小する

## 対象ファイル

`nts-gate-lp/src/components/partner-lp/HeroSection.module.css` — このファイルだけ

---

## 目標

ノートPC幅（1024〜1439px）で見出しを以下の **2行** に収める:

- 1行目:「補助金が使えますよ」
- 2行目: その一言で、営業が変わる。

現状は4行に割れている。左カラムの幅が足りないため。

---

## 方針

左カラムを広げるのではなく、**右カラムとフォームユニットを縮小**して左に余裕を作る。
具体的には右カラムの `flex-basis` を小さくし、フォーム内部を `scale()` で縮小する。

---

## 修正内容

### 修正1: 汎用 `@media (min-width: 1024px)` のカラム比率を変更

現在:
```css
@media (min-width: 1024px) {
  .content {
    flex: 0 1 35%;
    ...
  }
}

@media (min-width: 1024px) {
  .imgCol {
    flex: 0 1 62%;
    ...
  }
}
```

変更後:
```css
@media (min-width: 1024px) {
  .content {
    flex: 0 1 42%;
    ...他のプロパティはそのまま
  }
}

@media (min-width: 1024px) {
  .imgCol {
    flex: 0 1 55%;
    ...他のプロパティはそのまま
  }
}
```

### 修正2: ノートPC帯 `@media (min-width: 1024px) and (max-width: 1439px)` のカラム比率を変更

現在:
```css
.content {
  flex: 0 1 38%;
  ...
  max-width: 38%;
}

.imgCol {
  flex: 0 1 58%;
  ...
  max-width: 58%;
}

.partnerFormVideoUnit {
  width: 86%;
  max-width: 86%;
  ...
}
```

変更後:
```css
.content {
  flex: 0 1 44%;
  width: auto;
  min-width: 0;
  max-width: 44%;
}

.imgCol {
  flex: 0 1 52%;
  width: auto;
  min-width: 0;
  max-width: 52%;
  transform: none;
  overflow: hidden;
}

.partnerFormVideoUnit {
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: 0;
  zoom: 1;
  transform: scale(0.88);
  transform-origin: top right;
}
```

### 修正3: ノートPC帯の見出しフォントサイズを少し上げる

現在:
```css
.headline {
  font-size: clamp(22px, 2.4vw, 30px);
  max-width: 100%;
}
```

変更後:
```css
.headline {
  font-size: clamp(24px, 2.8vw, 34px);
  max-width: 100%;
}
```

### 修正4: `.headlineLine` のノートPC帯で1行目だけ nowrap にする

現在:
```css
.headlineLine {
  display: block;
  white-space: normal;
  word-break: auto-phrase;
  overflow-wrap: break-word;
}
```

変更後:
```css
.headlineLine {
  display: block;
  white-space: nowrap;
}

.headlineAccent {
  display: block;
  white-space: nowrap;
  max-width: 100%;
  overflow-wrap: anywhere;
}
```

**注意:** ここで `nowrap` に戻しても、修正1・2でカラム比率を変えたので重なりは起きない。
1行目「「補助金が使えますよ」」= 約11文字、2行目「その一言で、営業が変わる。」= 約13文字。
左カラム44%（≒ 約450px @1024px）に対して、`font-size: clamp(24px, 2.8vw, 34px)` なら十分1行に収まる。

---

## やってはいけないこと

- 左カラムの `flex-shrink: 0` にしない（gap分を吸収できなくなる）
- フォームの中身（HTML構造やフィールド配置）を変更しない
- TSXの変更は不要

## 確認方法

ブラウザの DevTools でウィンドウ幅を 1024px・1200px・1439px に設定し:
1. 見出しが2行（「補助金が使えますよ」/ その一言で、営業が変わる。）に収まっている
2. 左の見出しと右のフォームが重なっていない
3. 右のフォームが小さくなりすぎて使いにくくなっていない（scale 0.88 で約12%縮小）
