# 修正指示: 見出し1行目の閉じカギ括弧「」」が2行目に落ちる問題

## 対象ファイル

`nts-gate-lp/src/components/partner-lp/HeroSection.module.css` — このファイルだけ

---

## 現象

ノートPC幅（1024〜1439px）で見出し1行目「「補助金が使えますよ」」の閉じカギ括弧「」」だけが2行目に押し出されている。

---

## 原因

前回の修正で `.headlineLine` に `word-break: keep-all` を指定した。
`keep-all` は日本語テキストで「単語の途中で改行しない」挙動になるが、カギ括弧を含むテキストだと閉じ括弧の直前が改行禁止ポイントになるため、カラム幅がわずかに足りないと括弧1文字だけが次行に落ちる。

---

## 修正内容

### 修正箇所1: 汎用 `@media (min-width: 1024px)` 内の `.headlineLine`

**Before:**
```css
.headlineLine {
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

**After:**
```css
.headlineLine {
  white-space: normal;
  word-break: auto-phrase;
  overflow-wrap: break-word;
}
```

### 修正箇所2: ノートPC帯 `@media (min-width: 1024px) and (max-width: 1439px)` 内の `.headlineLine`

**Before:**
```css
.headlineLine {
  display: block;
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

**After:**
```css
.headlineLine {
  display: block;
  white-space: normal;
  word-break: auto-phrase;
  overflow-wrap: break-word;
}
```

### `auto-phrase` が効かないブラウザへのフォールバック

`word-break: auto-phrase` は Chrome 119+ / Edge 119+ で対応済みだが、Safari / Firefox は未対応。
未対応ブラウザでは `word-break` のデフォルト値 `normal` にフォールバックし、日本語は文字単位で自然に改行されるため、括弧だけが落ちる問題は起きない。
つまりフォールバック時も安全。

---

## やってはいけないこと

- `word-break: keep-all` に戻さない（括弧落ちが再発する）
- `white-space: nowrap` にしない（重なりが再発する）
- フォントサイズを小さくして無理やり1行に収める対応はしない
- TSXの変更は不要

## 確認方法

ブラウザの DevTools でウィンドウ幅を 1024px〜1300px あたりにし、「「補助金が使えますよ」」が閉じ括弧含めて1行に収まっていることを確認する。
