import { ShieldCheck } from "lucide-react";

type DisclaimerVariant = "full" | "short";

interface Props {
  variant?: DisclaimerVariant;
  className?: string;
}

const FULL_TEXT =
  "当社の補助金活用支援は、補助金情報の整理、対象制度の確認、事業計画・投資内容の整理等を支援するものです。官公署に提出する申請書類の作成・提出等、行政書士法その他法令により資格者が行うべき業務については、必要に応じて提携行政書士法人等が対応します。補助金の採択を保証するものではありません。";

const SHORT_TEXT =
  "当社は補助金情報の整理・申請準備に向けた相談支援を行います。申請書類の作成・提出等、資格者が行うべき業務は提携行政書士法人等が対応します。採択を保証するものではありません。";

export default function SubsidyLegalDisclaimer({
  variant = "short",
  className = "",
}: Props) {
  const text = variant === "full" ? FULL_TEXT : SHORT_TEXT;

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
          aria-hidden
        />
        <p className="text-xs leading-relaxed text-slate-600">{text}</p>
      </div>
    </div>
  );
}
