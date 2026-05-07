# 修正指示: Partner LP ファーストビュー 左右カラム重なり解消

## 対象ファイル

`nts-gate-lp/src/components/partner-lp/HeroSection.module.css` — **このファイルだけ**触ること。TSXは変更不要。

---

## 現象

1024px〜1439px（ノートPC幅）で、左カラムの見出し「「補助金が使えますよ」その一言で、営業が変わる。」の末尾が右カラムのフォームボックスと重なっている。

---

## 根本原因（3つ同時に起きている）

### 原因1: 幅の合計 + gap > 100%

`.heroMain` に `gap: clamp(12px, 2vw, 24px)` がある。
`.content` が `width: 40%`、`.imgCol` が `width: 58%` → 合計98%。
ここに gap が加わり「98% + gap px」＝ コンテナ幅を超える。

### 原因2: 両カラムとも flex-shrink: 0

`.content { flex-shrink: 0 }` と `.imgCol { flex: 0 0 auto }` で、どちらも「絶対に縮まない」指定。コンテナ幅を超えてもブラウザは縮小できず、はみ出す。

### 原因3: headlineLine の white-space: nowrap が残存

344行目の `@media (min-width: 1024px)` ブロックで `.headlineLine { white-space: nowrap; }` が指定されている。ノートPC帯のメディアクエリで `white-space: normal` に上書きしているが、CSSカスケード上、同じ詳細度だと**後に書かれた方が勝つ**。344行目のブロックは356行目のノートPC帯ブロックより前にあるが、同じ詳細度で `min-width: 1024px` は `min-width: 1024px and max-width: 1439px` にも該当するため、状況次第で nowrap が残る。nowrap だと見出しテキストが1行で右へ突き抜ける。

---

## 修正内容（正確にこの通りに書き換えること）

### 修正1: ノートPC帯のカラム幅を gap を差し引いた calc に変更し、flex-shrink を許可

356行目付近の `@media (min-width: 1024px) and (max-width: 1439px)` ブロック内の `.content` と `.imgCol` を以下に変更:

```css
.content {
  flex: 0 1 38%;        /* 38%をベースに、gapの分だけ縮んでよい */
  width: auto;          /* 固定widthを解除 */
  min-width: 0;         /* flex子要素の最小幅制約を解除 */
  max-width: 38%;
}

.imgCol {
  flex: 0 1 58%;        /* 58%をベースに、gapの分だけ縮んでよい */
  width: auto;
  min-width: 0;
  max-width: 58%;
}
```

**ポイント:** `flex-shrink` を `0` → `1` にすることで gap 分だけ自然に縮む。`width: auto` で固定幅を外し flex-basis に任せる。

### 修正2: headlineLine の nowrap を確実に解除

344行目付近の `@media (min-width: 1024px)` 内にある `.headlineLine { white-space: nowrap; }` を削除するか、ノートPC帯ブロックの `.headlineLine` に `!important` を付けずに以下のように書く:

356行目のノートPC帯ブロック内に、**既存の headlineLine 指定をこれに差し替え**:

```css
.headlineLine {
  display: block;
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

### 修正3: 116行目付近のノートPC帯ブロック（1つ目）にある重複指定を削除

116行目と356行目に同じ `@media (min-width: 1024px) and (max-width: 1439px)` ブロックが**2つ存在している**。これが混乱の元。**116行目のブロックの中身をすべて356行目のブロックに統合し、116行目のブロックは丸ごと削除する。**

統合後の356行目ブロックの全体像:

```css
@media (min-width: 1024px) and (max-width: 1439px) {
  .page {
    min-height: 0;
    height: auto;
    padding-top: 24px;
    padding-bottom: 0;
  }

  .heroMain {
    flex: 0 0 auto;
    padding-left: max(16px, 2vw);
    padding-right: max(16px, 2vw);
    padding-bottom: 24px;
    gap: clamp(12px, 2vw, 24px);
    align-items: flex-start;
  }

  .content {
    flex: 0 1 38%;
    width: auto;
    min-width: 0;
    max-width: 38%;
  }

  .imgCol {
    flex: 0 1 58%;
    width: auto;
    min-width: 0;
    max-width: 58%;
    transform: none;
    overflow: hidden;
  }

  .partnerFormVideoUnit {
    width: 86%;
    max-width: 86%;
    margin-left: auto;
    margin-right: 0;
    zoom: 1;
  }

  .partnerVideoCardBody {
    min-height: 0;
    padding: 8px;
  }

  .headline {
    font-size: clamp(22px, 2.4vw, 30px);
    max-width: 100%;
  }

  .headlineLine {
    display: block;
    white-space: normal;
    word-break: keep-all;
    overflow-wrap: break-word;
  }

  .headlineAccent {
    display: block;
    max-width: 100%;
    overflow-wrap: anywhere;
  }
}
```

---

## やってはいけないこと

- `width` の固定パーセントと `flex-shrink: 0` を同時に使わない
- ノートPC帯のメディアクエリを複数箇所に分散させない（1つに統合する）
- `!important` は使わない
- TSXやclassName の変更は不要

## 確認方法

ブラウザの DevTools でウィンドウ幅を 1024px・1200px・1439px にし、左の見出しテキストが右フォームに重ならないことを確認する。
