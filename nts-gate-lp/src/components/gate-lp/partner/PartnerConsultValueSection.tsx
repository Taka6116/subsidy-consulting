"use client";

import Image from "next/image";
import isometric04 from "../../../../icon-assets/isometric_04.png";
import isometric06 from "../../../../icon-assets/isometric_06.png";
import isometric08 from "../../../../icon-assets/isometric_08.png";
import isometric10 from "../../../../icon-assets/isometric_10.png";
import isometric11 from "../../../../icon-assets/isometric_11.png";

const steps = [
  {
    image: isometric06,
    title: "ヒアリング・対話",
    body: "経営層や現場の方への対話を通じて、事業や組織の実態を多角的に理解します。",
  },
  {
    image: isometric10,
    title: "情報収集・分析",
    body: "既存資料や公開情報なども活用し、課題の背景や構造を整理・分析します。",
  },
  {
    image: isometric11,
    title: "課題の深掘り・特定",
    body: "表面的な課題にとどまらず、本質的な経営課題を特定し、優先順位を明確化します。",
  },
  {
    image: isometric08,
    title: "解決の方向性を設計",
    body: "特定した課題に対する解決の方向性や、最適な人材・プロジェクトを設計します。",
  },
  {
    image: isometric04,
    title: "最適なご提案",
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
        {/* 見出し */}
        <div className="mb-14">
          <h2
            className="font-heading"
            style={{
              fontSize: "clamp(1.8rem, 3vw, 3rem)",
              fontWeight: 700,
              lineHeight: 1.45,
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
            <span style={{ color: "var(--color-primary, #1a56db)" }}>深掘りします。</span>
          </h2>

          <p
            className="font-body"
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.9,
              color: "var(--text-secondary, #4b5563)",
              textAlign: "center",
              marginBottom: 0,
            }}
          >
            机上の情報だけでなく、対話や現場理解を通じて本質的な課題を見極め、
            最適な解決策をご提案します。
          </p>
        </div>

        {/* フロー（連結デザイン） */}
        <div className="overflow-x-auto pb-2">
          <div
            style={{
              minWidth: "1040px",
              background: "#ffffff",
              borderRadius: "14px",
            }}
          >
            <div className="grid grid-cols-5">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  style={{
                    position: "relative",
                    minHeight: "338px",
                    borderRight: index < steps.length - 1 ? "1px solid #eceff4" : "none",
                    padding: "10px 18px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "104px",
                      height: "104px",
                      borderRadius: "999px",
                      background: index % 2 === 0 ? "#f3f7ff" : "#eff9f2",
                      position: "relative",
                      marginBottom: "16px",
                      overflow: "hidden",
                    }}
                  >
                    <Image src={step.image} alt={step.title} fill className="object-contain p-4" />
                  </div>
                  <h3
                    className="font-heading"
                    style={{
                      fontSize: "1.08rem",
                      fontWeight: 700,
                      color: "var(--text-primary, #111827)",
                      lineHeight: 1.5,
                      marginBottom: "12px",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="font-body"
                    style={{
                      fontSize: "0.89rem",
                      lineHeight: 1.85,
                      color: "var(--text-secondary, #4b5563)",
                      margin: 0,
                    }}
                  >
                    {step.body}
                  </p>
                  {index < steps.length - 1 && (
                    <span
                      style={{
                        position: "absolute",
                        right: "-11px",
                        top: "44%",
                        transform: "translateY(-50%)",
                        width: "22px",
                        height: "22px",
                        borderRadius: "999px",
                        background: "#ffffff",
                        color: "var(--color-primary, #1a56db)",
                        border: "1px solid #e5edf6",
                        fontSize: "14px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                      }}
                      aria-hidden
                    >
                      &gt;
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
