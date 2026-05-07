# 指示: git lock 解除 → コミット → プッシュ

CSSの修正は既に適用済みです。gitのロックファイルが残っているため、以下を**この順番通りに**ターミナルで実行してください。

## 手順

```bash
cd 補助金サービスV6
rm -f .git/index.lock
git add nts-gate-lp/src/components/partner-lp/HeroSection.module.css
git commit -m "fix(partner-fv): remove nowrap and flex-shrink:0 from base 1024px+ rules"
git push
```

---

## 何が変わったのか（前回の指示書で直らなかった理由）

前回の指示書は「ノートPC帯の専用メディアクエリ（1024〜1439px）」だけを修正対象にしていた。
しかし問題の根っこは**その前に書かれた汎用の `@media (min-width: 1024px)` ブロック**にあった。

ノートPC帯（1024〜1439px）は `min-width: 1024px` にも該当するため、**汎用ブロックのルールも同時に適用される**。
CSSは同じ詳細度なら後に書いた方が勝つが、CSSモジュールのビルド時にクラス名がハッシュ化される過程で順序が保証されないケースがある。
そのため、ノートPC帯だけで上書きしても汎用ブロック側の危険な指定が残っていると効果がなかった。

### 今回修正した3箇所（すべて汎用 `@media (min-width: 1024px)` 内）

| 箇所 | Before（問題） | After（修正後） | なぜ問題だったか |
|------|---------------|----------------|-----------------|
| `.content` (105行目) | `flex: 0 0 auto; width: 35%;` | `flex: 0 1 35%; width: auto; min-width: 0;` | `flex-shrink: 0` で「絶対に縮まない」指定。gap分を吸収できず右カラムとぶつかる |
| `.imgCol` (123行目) | `flex: 0 0 auto; width: 65%;` | `flex: 0 1 62%; width: auto; min-width: 0;` | 同上。35% + 65% + gap > 100% なのに縮小不可 |
| `.headlineLine` (292行目) | `white-space: nowrap;` | `white-space: normal; word-break: keep-all; overflow-wrap: break-word;` | nowrapで見出しテキストが折り返せず、`.content`の幅を突き破って右へ伸びる |

### なぜこれで直るのか

1. `flex-shrink: 1` により、gap分だけ両カラムが自然に縮む → 合計が100%を超えない
2. `white-space: normal` により、見出しが長くてもカラム幅内で折り返す
3. `min-width: 0` により、flexの子要素の最小幅制約が解除され、コンテンツに引きずられてカラムが膨らまない
4. 汎用ブロック自体を安全な値にしたので、ノートPC帯で上書きが効くかどうかに依存しない
