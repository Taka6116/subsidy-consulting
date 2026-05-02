"use client";

export default function PartnerConsultValueSection() {
  return (
    <section
      style={{
        padding: "80px 24px",
        background: "var(--bg-surface, #f8fafc)",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* ラベル */}
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-primary, #1a56db)",
            marginBottom: "16px",
          }}
        >
          Partner Benefit
        </p>

        {/* 見出し */}
        <h2
          className="font-heading"
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 700,
            lineHeight: 1.4,
            color: "var(--text-primary, #111827)",
            marginBottom: "20px",
          }}
        >
          紹介するだけではありません。
          <br />
          NTSがクライアントの経営課題を、
          <br />
          御社の代わりに深掘りします。
        </h2>

        {/* リード文 */}
        <p
          className="font-body"
          style={{
            fontSize: "1rem",
            lineHeight: 1.9,
            color: "var(--text-secondary, #4b5563)",
            marginBottom: "48px",
            maxWidth: "640px",
          }}
        >
          通常、経営課題のヒアリング・整理には専門的なコンサルティングが必要で、
          外部に依頼すると月額20万円前後のコストがかかります。
          NTSとご提携いただくと、補助金サポートの伴走過程でこれをすべて無料で担います。
        </p>

        {/* 3カード */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          {[
            {
              num: "01",
              title: "見えていなかった課題が見える",
              body: "NTSがクライアントの事業を深掘りする中で、御社だけでは気づけなかった経営課題が浮き彫りになります。",
            },
            {
              num: "02",
              title: "クロスセルの機会が生まれる",
              body: "把握した課題は御社にもフィードバック。御社サービスの追加提案・クロスセルに直接活用できます。",
            },
            {
              num: "03",
              title: "クライアントとの関係が深まる",
              body: "補助金という入口から、経営全体の伴走者として御社のポジションが自然に高まります。",
            },
          ].map((card) => (
            <div
              key={card.num}
              style={{
                background: "var(--bg-base, #ffffff)",
                border: "1px solid var(--border-subtle, #e5e7eb)",
                borderRadius: "12px",
                padding: "28px 24px",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "var(--color-primary, #1a56db)",
                  marginBottom: "12px",
                }}
              >
                {card.num}
              </span>
              <h3
                className="font-heading"
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--text-primary, #111827)",
                  marginBottom: "10px",
                  lineHeight: 1.5,
                }}
              >
                {card.title}
              </h3>
              <p
                className="font-body"
                style={{
                  fontSize: "0.875rem",
                  lineHeight: 1.8,
                  color: "var(--text-secondary, #4b5563)",
                  margin: 0,
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>

        {/* 比較バー */}
        <div
          style={{
            background: "var(--bg-base, #ffffff)",
            border: "1px solid var(--border-subtle, #e5e7eb)",
            borderRadius: "12px",
            padding: "28px 32px",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              className="font-body"
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary, #9ca3af)",
                marginBottom: "4px",
              }}
            >
              一般的な経営コンサルティング
            </p>
            <p
              className="font-heading"
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-primary, #111827)",
              }}
            >
              月額 <span style={{ textDecoration: "line-through" }}>20万円〜</span>
            </p>
          </div>
          <div
            style={{
              fontSize: "1.5rem",
              color: "var(--color-primary, #1a56db)",
              fontWeight: 700,
            }}
          >
            →
          </div>
          <div>
            <p
              className="font-body"
              style={{
                fontSize: "0.75rem",
                color: "var(--color-primary, #1a56db)",
                marginBottom: "4px",
                fontWeight: 600,
              }}
            >
              NTSパートナープログラムなら
            </p>
            <p
              className="font-heading"
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--color-primary, #1a56db)",
              }}
            >
              無料で提供
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
