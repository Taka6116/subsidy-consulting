"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const INPUT =
  "mt-1.5 w-full rounded-lg border border-[#DCE8F2] bg-white px-4 py-3 text-sm text-[#0B173A] outline-none transition placeholder:text-gray-400 focus:border-[#008894] focus:ring-2 focus:ring-[#008894]/15";

const LABEL = "block text-sm font-bold text-[#0B173A]";

type Props = {
  /** どのLPから送られたか（API側のsourceフィールドに使用） */
  source: string;
  /** 補助金名（コピー文に使用） */
  grantName?: string;
};

export default function ContactSection({ source, grantName }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      company: fd.get("company") as string,
      message: fd.get("message") as string,
      source,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "送信に失敗しました。");
      }
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "送信に失敗しました。");
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="bg-[#F3F6FA] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">

          {/* 左：コピー */}
          <div className="lg:w-[44%] lg:pt-2">
            <span className="mb-4 inline-block rounded-full bg-[#FEA00D]/15 px-3 py-1 text-xs font-bold text-[#FEA00D]">
              無料相談受付中
            </span>
            <h2 className="text-2xl font-bold leading-tight text-[#0B173A] md:text-3xl">
              まずは、気軽にご相談ください。
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              {grantName
                ? `「${grantName}」について、自社が対象か分からない・申請の手順が不安・どれくらい補助が受けられるかを確認したい、など。`
                : "対象かどうかの確認だけでも構いません。申請の手順・補助額・必要書類など、どんな疑問もお気軽にどうぞ。"}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "相談・診断は完全無料",
                "全国の中小企業・小規模事業者に対応",
                "申請から受給まで専門家が伴走",
                "採択率を高める戦略を一緒に設計",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#008894]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 右：フォーム */}
          <div className="flex-1">
            {status === "done" ? (
              <div className="flex flex-col items-center rounded-2xl border border-[#008894]/30 bg-white px-8 py-12 text-center shadow-sm">
                <CheckCircle2 className="mb-4 h-12 w-12 text-[#008894]" />
                <p className="text-lg font-bold text-[#0B173A]">
                  送信が完了しました
                </p>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-600">
                  お問い合わせを受け付けました。担当よりご連絡いたしますので、今しばらくお待ちください。
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-[#DCE8F2] bg-white px-7 py-8 shadow-sm"
              >
                <div className="space-y-5">
                  <div>
                    <label htmlFor={`contact-name-${source}`} className={LABEL}>
                      お名前<span className="ml-1 text-[#d94a4a]">*</span>
                    </label>
                    <input
                      id={`contact-name-${source}`}
                      name="name"
                      type="text"
                      required
                      placeholder="山田 太郎"
                      autoComplete="name"
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <label htmlFor={`contact-email-${source}`} className={LABEL}>
                      メールアドレス<span className="ml-1 text-[#d94a4a]">*</span>
                    </label>
                    <input
                      id={`contact-email-${source}`}
                      name="email"
                      type="email"
                      required
                      placeholder="example@company.co.jp"
                      autoComplete="email"
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <label htmlFor={`contact-company-${source}`} className={LABEL}>
                      会社名（任意）
                    </label>
                    <input
                      id={`contact-company-${source}`}
                      name="company"
                      type="text"
                      placeholder="株式会社〇〇"
                      autoComplete="organization"
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <label htmlFor={`contact-message-${source}`} className={LABEL}>
                      お問い合わせ内容<span className="ml-1 text-[#d94a4a]">*</span>
                    </label>
                    <textarea
                      id={`contact-message-${source}`}
                      name="message"
                      rows={4}
                      required
                      placeholder="気になること、確認したいことを自由にご記入ください。"
                      className={`${INPUT} resize-y`}
                    />
                  </div>

                  {status === "error" && (
                    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEA00D] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#e8900a] disabled:opacity-60"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        送信中…
                      </>
                    ) : (
                      "無料相談を申し込む →"
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    送信後、担当者よりメールにてご連絡します。
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
