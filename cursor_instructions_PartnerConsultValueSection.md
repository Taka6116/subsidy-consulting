# Cursor 実装指示書
## 対象ファイル
`src/components/gate-lp/partner/PartnerConsultValueSection.tsx`

---

## 概要

「紹介するだけではありません。NTSがクライアントの経営課題を、御社の代わりに深掘りします。」セクションを、**5ステップのフロー図レイアウト**にリデザインする。

参考デザイン：水色〜白の淡いカードが横並びに5列、各カードの上にIsometricイラスト、下にタイトルと説明文。カード間は「›」矢印で繋がれる。ステップ番号（01〜05）はなし。

---

## レイアウト構造

```
[セクション全体: background: var(--bg-surface)]

  [ラベル: "NTSの伴走スタイル"]

  [見出し h2]
  紹介するだけではありません。
  NTSがクライアントの経営課題を、御社の代わりに深掘りします。
  （「深掘りします。」の部分は color: var(--color-primary) で強調）

  [サブコピー p]
  机上の情報だけでなく、対話や現場理解を通じて本質的な課題を見極め、
  最適な解決策をご提案します。

  [5ステップ フローカード 横並び]
  カード1 → カード2 → カード3 → カード4 → カード5

  [下部バナー: 課題を持つ企業をサポートする旨のメッセージ]
```

---

## 5ステップの内容

```ts
const steps = [
  {
    image: "/icon-assets/isometric_06.png",
    title: "ヒアリング・対話",
    body: "経営層や現場の方への対話を通じて、事業や組織の実態を多角的に理解します。",
  },
  {
    image: "/icon-assets/isometric_10.png",
    title: "情報収集・分析",
    body: "既存資料や公開情報なども活用し、課題の背景や構造を整理・分析します。",
  },
  {
    image: "/icon-assets/isometric_11.png",
    title: "課題の深掘り・特定",
    body: "表面的な課題にとどまらず、本質的な経営課題を特定し、優先順位を明確化します。",
  },
  {
    image: "/icon-assets/isometric_08.png",
    title: "解決の方向性を設計",
    body: "特定した課題に対する解決の方向性や、最適な人材・プロジェクトを設計します。",
  },
  {
    image: "/icon-assets/isometric_04.png",
    title: "最適なご提案・マッチング",
    body: "課題解決に最適なソリューションをご提案し、実行まで丁寧に伴走サポートします。",
  },
];
```

---

## 実装コード（完全版）

以下のコードで `PartnerConsultValueSection.tsx` を**丸ごと置き換える**：

```tsx
"use client";

import Image from "next/image";

const steps = [
  {
    image: "/icon-assets/isometric_06.png",
    title: "ヒアリング・対話",
    body: "経営層や現場の方への対話を通じて、事業や組織の実態を多角的に理解します。",
  },
  {
    image: "/icon-assets/isometric_10.png",
    title: "情報収集・分析",
    body: "既存資料や公開情報なども活用し、課題の背景や構造を整理・分析します。",
  },
  {
    image: "/icon-assets/isometric_11.png",
    title: "課題の深掘り・特定",
    body: "表面的な課題にとどまらず、本質的な経営課題を特定し、優先順位を明確化します。",
  },
  {
    image: "/icon-assets/isometric_08.png",
    title: "解決の方向性を設計",
    body: "特定した課題に対する解決の方向性や、最適な人材・プロジェクトを設計します。",
  },
  {
    image: "/icon-assets/isometric_04.png",
    title: "最適なご提案・マッチング",
    body: "課題解決に最適なソリューションをご提案し、実行まで丁寧に伴走サポートします。",
  },
];

export default function PartnerConsultValueSection() {
  return (
    <section
      style={{
        padding: "96px 24px",
        background: "var(--bg-surface, #f8fafc)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* ラベル */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "var(--color-primary, #1a56db)",
              border: "1px solid var(--color-primary, #1a56db)",
              borderRadius: "999px",
              padding: "4px 16px",
            }}
          >
            NTSの伴走スタイル
          </span>
        </div>

        {/* 見出し */}
        <h2
          className="font-heading"
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            fontWeight: 700,
            lineHeight: 1.5,
            color: "var(--text-primary, #111827)",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          紹介するだけではありません。
          <br />
          NTSがクライアントの経営課題を、
          <br />
          御社の代わりに
          <span style={{ color: "var(--color-primary, #1a56db)" }}>
            深掘りします。
          </span>
        </h2>

        {/* サブコピー */}
        <p
          className="font-body"
          style={{
            fontSize: "0.95rem",
            lineHeight: 1.9,
            color: "var(--text-secondary, #4b5563)",
            textAlign: "center",
            marginBottom: "64px",
          }}
        >
          机上の情報だけでなく、対話や現場理解を通じて本質的な課題を見極め、
          <br className="hidden-sp" />
          最適な解決策をご提案します。
        </p>

        {/* フローカード */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {steps.map((step, index) => (
            <div
              key={step.title}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              {/* カード本体 */}
              <div
                style={{
                  background: "var(--bg-base, #ffffff)",
                  border: "1px solid var(--border-subtle, #e5e7eb)",
                  borderRadius: "16px",
                  padding: "24px 20px 28px",
                  width: "168px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "0",
                }}
              >
                {/* イラスト */}
                <div
                  style={{
                    width: "120px",
                    height: "100px",
                    position: "relative",
                    marginBottom: "16px",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>

                {/* タイトル */}
                <h3
                  className="font-heading"
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "var(--text-primary, #111827)",
                    marginBottom: "10px",
                    lineHeight: 1.5,
                  }}
                >
                  {step.title}
                </h3>

                {/* 説明文 */}
                <p
                  className="font-body"
                  style={{
                    fontSize: "0.78rem",
                    lineHeight: 1.8,
                    color: "var(--text-secondary, #4b5563)",
                    margin: 0,
                  }}
                >
                  {step.body}
                </p>
              </div>

              {/* 矢印（最後のカード以外） */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    paddingTop: "80px",
                    flexShrink: 0,
                    color: "var(--color-primary, #1a56db)",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                  }}
                >
                  ›
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 下部バナー */}
        <div
          style={{
            marginTop: "56px",
            background: "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)",
            border: "1px solid #bfdbfe",
            borderRadius: "16px",
            padding: "32px 40px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <p
            className="font-heading"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              fontWeight: 700,
              color: "var(--color-primary, #1a56db)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            私たちは、課題の
            <span style={{ textDecoration: "underline", textDecorationColor: "#93c5fd" }}>
              "本質"
            </span>
            に向き合うことで、
            <br />
            御社の意思決定と変革を力強くサポートします。
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
            }}
          >
            {["事業成長", "組織力強化", "持続可能な経営"].map((tag) => (
              <div
                key={tag}
                style={{
                  background: "#ffffff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "999px",
                  padding: "6px 16px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-primary, #1a56db)",
                  whiteSpace: "nowrap",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
```

---

## レスポンシブ対応（追加CSS）

`src/app/globals.css` または該当のCSSファイルに追記：

```css
/* PartnerConsultValueSection モバイル対応 */
@media (max-width: 768px) {
  .partner-flow-wrap {
    flex-direction: column;
    align-items: center;
  }
  .partner-flow-arrow {
    transform: rotate(90deg);
    padding-top: 0;
    padding-left: 0;
  }
}
```

ただし、上記コードはinlineスタイルで記述しているため、モバイルでのflex折り返し（`flexWrap: "wrap"`）により自動的に縦並びになる設計になっている。矢印の向きはモバイルでもそのまま横向きで可。

---

## 画像パスの確認

以下のファイルが `public/icon-assets/` 以下に存在することを確認すること：

- `isometric_04.png` ✅（握手する2人）
- `isometric_06.png` ✅（2人が会話・ラップトップ）
- `isometric_08.png` ✅（タブレット確認の2人）
- `isometric_10.png` ✅（PCデスクで作業する人）
- `isometric_11.png` ✅（プレゼンボードを指す人）

存在しない場合は `icon-assets/` ルートから `public/icon-assets/` にコピーすること：
```bash
cp nts-gate-lp/icon-assets/isometric_04.png nts-gate-lp/public/icon-assets/
cp nts-gate-lp/icon-assets/isometric_06.png nts-gate-lp/public/icon-assets/
cp nts-gate-lp/icon-assets/isometric_08.png nts-gate-lp/public/icon-assets/
cp nts-gate-lp/icon-assets/isometric_10.png nts-gate-lp/public/icon-assets/
cp nts-gate-lp/icon-assets/isometric_11.png nts-gate-lp/public/icon-assets/
```

---

## デザイン仕様まとめ

| 要素 | 仕様 |
|------|------|
| セクション背景 | `var(--bg-surface)` = `#f8fafc` |
| カード背景 | `var(--bg-base)` = `#ffffff` |
| カード角丸 | `16px` |
| カード幅 | `168px`（固定） |
| イラストエリア | `120×100px`（object-fit: contain） |
| 矢印 | `›`（›）、プライマリブルー、fontSize 1.25rem |
| ステップ番号 | **なし**（削除） |
| 下部バナー | 薄い水色グラデ背景 + 3タグ（事業成長・組織力強化・持続可能な経営） |
| フォント | 見出し: `font-heading`、本文: `font-body` |
| カラーアクセント | `var(--color-primary, #1a56db)` |
