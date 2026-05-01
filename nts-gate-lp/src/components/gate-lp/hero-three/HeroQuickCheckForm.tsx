"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { INDUSTRY_OPTIONS } from "@/data/industryOptions";
import { JAPAN_PREFECTURES } from "@/data/japanPrefectures";
import { trackCTAClick } from "@/lib/analytics";
import styles from "./HeroSection.module.css";

const EMPLOYEE_OPTIONS: { id: string; label: string }[] = [
  { id: "", label: "選択しない" },
  { id: "1〜5人", label: "1〜5人" },
  { id: "6〜20人", label: "6〜20人" },
  { id: "21〜50人", label: "21〜50人" },
  { id: "51〜100人", label: "51〜100人" },
  { id: "101〜300人", label: "101〜300人" },
  { id: "301人以上", label: "301人以上" },
];

const BUSINESS_NOTES_MAX = 500;

export default function HeroQuickCheckForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [companyWebsiteUrl, setCompanyWebsiteUrl] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [employees, setEmployees] = useState("");
  const [businessNotes, setBusinessNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError("会社名を入力してください。");
      return;
    }
    if (!industryId) {
      setError("業種を選択してください。");
      return;
    }
    if (!prefecture) {
      setError("所在地（都道府県）を選択してください。");
      return;
    }

    setSubmitting(true);
    trackCTAClick("hero_quick_check_submit");

    const params = new URLSearchParams({
      company: companyName.trim(),
      industry: industryId,
      prefecture,
      autorun: "1",
    });
    const url = companyWebsiteUrl.trim();
    if (url) params.set("url", url);
    if (employees) params.set("employees", employees);
    const notes = businessNotes.trim();
    if (notes) params.set("businessNotes", notes);

    router.push(`/check?${params.toString()}`);
  };

  return (
    <div className={styles.formCard} aria-label="補助金クイック診断フォーム">
      <div className={styles.formBody}>
        <div className={styles.formCardHead}>
          <span className={styles.formCardTitle}>対象補助金を約60秒で表示</span>
        </div>
        <p className={styles.formCardLead}>
          AIが御社の事業を読み取り、対象制度だけを抽出します。
          <br />
          <strong>氏名・連絡先は不要です。</strong>
        </p>

        <form onSubmit={handleSubmit} className={styles.formGrid} noValidate>
          <div className={styles.formField}>
            <label htmlFor="hero-quick-company" className={styles.formLabel}>
              会社名 <span className={styles.formRequired}>*</span>
            </label>
            <input
              id="hero-quick-company"
              type="text"
              autoComplete="organization"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="株式会社日本提携支援"
              className={`${styles.formInput} ${styles.formInputPrimary}`}
            />
          </div>

          <div className={styles.formField}>
            <label htmlFor="hero-quick-url" className={styles.formLabel}>
              公式サイトURL
              <span className={styles.formLabelOptional}>（任意・推奨）</span>
            </label>
            <input
              id="hero-quick-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={companyWebsiteUrl}
              onChange={(e) => setCompanyWebsiteUrl(e.target.value)}
              placeholder="https://nihon-teikei.co.jp/"
              className={styles.formInput}
            />
            <span className={styles.formHelp}>
              入れるとAIがページを読み取り、御社にフィットする制度を抽出します。
            </span>
          </div>

          <div className={styles.formRowDual}>
            <div className={styles.formField}>
              <label htmlFor="hero-quick-industry" className={styles.formLabel}>
                業種 <span className={styles.formRequired}>*</span>
              </label>
              <select
                id="hero-quick-industry"
                value={industryId}
                onChange={(e) => setIndustryId(e.target.value)}
                className={styles.formSelect}
              >
                <option value="">選択してください</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="hero-quick-prefecture" className={styles.formLabel}>
                所在地 <span className={styles.formRequired}>*</span>
              </label>
              <select
                id="hero-quick-prefecture"
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                className={styles.formSelect}
              >
                <option value="">選択してください</option>
                {JAPAN_PREFECTURES.filter((p) => p.id).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formField}>
            <label htmlFor="hero-quick-employees" className={styles.formLabel}>
              従業員数
              <span className={styles.formLabelOptional}>（任意）</span>
            </label>
            <select
              id="hero-quick-employees"
              value={employees}
              onChange={(e) => setEmployees(e.target.value)}
              className={styles.formSelect}
            >
              {EMPLOYEE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label htmlFor="hero-quick-business-notes" className={styles.formLabel}>
              事業内容・取扱い
              <span className={styles.formLabelOptional}>（任意・精度UP）</span>
            </label>
            <textarea
              id="hero-quick-business-notes"
              value={businessNotes}
              onChange={(e) => setBusinessNotes(e.target.value)}
              placeholder="例：ゴルフスクール運営、ゴルフ用品のEC販売"
              rows={2}
              maxLength={BUSINESS_NOTES_MAX}
              className={`${styles.formInput} ${styles.formTextarea}`}
            />
            <span className={styles.formHelp}>
              数行で結構です。会社固有の事業が分かるとマッチング精度が大きく上がります。
            </span>
          </div>

          {error ? <p className={styles.formError}>{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className={styles.formSubmit}
          >
            {submitting ? "照合中…" : "対象補助金を見る"}
            <span aria-hidden="true">→</span>
          </button>

          <p className={styles.formFootnote}>
            登録不要・無料 ／ 表示は参考例です。詳細は公募要領でご確認ください。
          </p>
        </form>
      </div>
    </div>
  );
}
