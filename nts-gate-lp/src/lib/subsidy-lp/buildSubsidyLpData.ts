/**
 * SubsidyGrant + GeneratedContent(lp) → SubsidyLpData
 *
 * LP コンポーネント群が受け取る正規化済みデータ型。
 * rawPayload の差異吸収・欠損ハンドリングをここに集約する。
 */

import type { SubsidyGrant, GeneratedContent } from "@prisma/client";

// ─────────────────────────────────────────────
// 型定義
// ─────────────────────────────────────────────

export type SubsidyLpData = {
  id: string;
  name: string;
  institutionName: string;
  /** 補助上限額の数値（ヒーロー表示などで使用。null = 不明） */
  amountValue: number | null;
  /** 補助上限額の表示文字列（例: "最大 1,500万円"） */
  amountLabel: string;
  /** 補助率の表示文字列（例: "1/2以内"） */
  rateLabel: string;
  /** 締切表示（例: "2025年3月31日" または "要確認"） */
  deadlineLabel: string;
  /** 残り日数（null = 不明 or 異常値） */
  remainingDays: number | null;
  /** 対象地域 */
  targetArea: string;
  /** 公募開始日の表示文字列 */
  acceptanceStart: string;
  /** 申請先URL（null = 不明） */
  officialUrl: string | null;

  // ── AI 生成コピー（存在する場合）──
  /** ヒーローキャッチコピー（AI生成 or フォールバック） */
  heroCopy: string;
  /** サブコピー */
  subCopy: string;
  /** 課題リスト（3〜5件） */
  pains: string[];
  /** 活用ユースケース（2〜3件） */
  useCases: Array<{ label: string; body: string; persona?: string }>;
  /** FAQ（3〜5件） */
  faqs: Array<{ q: string; a: string }>;

  /** 更新日の表示文字列（例: "2025年3月1日"） */
  updatedAtLabel: string;
};

// ─────────────────────────────────────────────
// ユーティリティ
// ─────────────────────────────────────────────

type RawLike = Record<string, unknown> | null;

function toRaw(v: unknown): RawLike {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as RawLike;
}

function str(raw: RawLike, key: string): string | null {
  const v = raw?.[key];
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function formatDateJP(raw: string | Date | null | undefined): string {
  if (!raw) return "要確認";
  const d = typeof raw === "string" ? new Date(raw) : raw;
  if (Number.isNaN(d.getTime())) return "要確認";
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatAmountJPY(n: number): string {
  if (n >= 100_000_000) {
    const oku = n / 100_000_000;
    return `最大 ${oku % 1 === 0 ? oku : oku.toFixed(1)}億円`;
  }
  if (n >= 10_000) {
    const man = n / 10_000;
    return `最大 ${man % 1 === 0 ? man.toLocaleString() : man.toFixed(0)}万円`;
  }
  return `最大 ${n.toLocaleString()}円`;
}

function resolveAmount(label: string | null, raw: RawLike): string {
  // rawPayload.subsidy_max_limit を最優先
  const n = Number(raw?.subsidy_max_limit ?? 0);
  if (Number.isFinite(n) && n > 0) return formatAmountJPY(n);

  // DB の maxAmountLabel が正常文字列ならそのまま
  if (label) {
    const stripped = label.trim();
    if (/^[\x20-\x7E぀-ヿ一-鿿,，。0-9円万億最大〜\s]+$/.test(stripped)) {
      const asNum = Number(stripped.replace(/[^\d]/g, ""));
      if (Number.isFinite(asNum) && asNum > 0) return formatAmountJPY(asNum);
      return stripped;
    }
  }
  return "要確認";
}

function resolveAmountValue(label: string | null, raw: RawLike, dbAmount: bigint | null): number | null {
  const rawValue = Number(raw?.subsidy_max_limit ?? 0);
  if (Number.isFinite(rawValue) && rawValue > 0) return rawValue;

  if (dbAmount !== null) {
    const dbValue = Number(dbAmount);
    if (Number.isFinite(dbValue) && dbValue > 0) return dbValue;
  }

  const labelValue = Number(label?.replace(/[^\d]/g, "") ?? 0);
  return Number.isFinite(labelValue) && labelValue > 0 ? labelValue : null;
}

function resolveRate(raw: RawLike, dbRate: string | null): string {
  const rv = raw?.subsidy_rate;
  if (typeof rv === "number" && rv > 0) {
    // 0〜1 の小数 or パーセント値
    return rv <= 1 ? `${Math.round(rv * 100)}%以内` : `${Math.round(rv)}%以内`;
  }
  if (typeof rv === "string" && rv.trim()) {
    const n = Number(rv);
    if (Number.isFinite(n)) {
      return n <= 1 ? `${Math.round(n * 100)}%以内` : `${Math.round(n)}%以内`;
    }
    return rv.trim();
  }
  if (dbRate) return dbRate;
  return "要確認";
}

const DEADLINE_MAX = new Date("2050-01-01");

function calcRemainingDays(
  deadlineLabel: string | null,
  deadline: Date | null,
): number | null {
  const target = deadline ?? (deadlineLabel ? new Date(deadlineLabel) : null);
  if (!target || Number.isNaN(target.getTime()) || target > DEADLINE_MAX) return null;
  return Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ─────────────────────────────────────────────
// AI コピーのパース（GeneratedContent.body は Markdown だが
// LP 用コンテンツは JSON 埋め込みで生成する設計）
// ─────────────────────────────────────────────

type LpAiPayload = {
  heroCopy?: string;
  subCopy?: string;
  pains?: string[];
  useCases?: Array<{ label?: string; body?: string; persona?: string }>;
  faqs?: Array<{ q?: string; a?: string }>;
};

const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "山梨県",
  "長野県",
  "富山県",
  "石川県",
  "福井県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

function normalizeTargetArea(value: string | null | undefined): string {
  const raw = value?.trim();
  if (!raw) return "全国";

  const prefectureHits = PREFECTURES.filter((p) => raw.includes(p)).length;
  if (raw.includes("全国") || prefectureHits >= 40) {
    return "全国";
  }

  if (raw.length > 80) {
    return "複数地域（詳細は公募要領で確認）";
  }

  return raw;
}

function sanitizeUseCaseText(value: string): string {
  return value
    .replace(/※?\s*架空(?:の)?(?:活用)?(?:事例|イメージ)?(?:です)?[。．、,\s]*/g, "")
    .replace(/※?\s*実際の採択事例ではありません[。．、,\s]*/g, "")
    .replace(/※\s*想定事例です[。．、,\s]*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLpAiPayload(content: GeneratedContent | null): LpAiPayload | null {
  if (!content?.body) return null;
  try {
    // body が JSON ブロックで包まれている場合を許容
    const jsonStr = content.body
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    return JSON.parse(jsonStr) as LpAiPayload;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// フォールバックコピー生成（AI未生成時）
// ─────────────────────────────────────────────

function fallbackPains(nameText: string): string[] {
  const t = nameText;
  if (t.includes("建設機械") || t.includes("重機") || t.includes("電動化")) {
    return [
      "燃料費の高騰で現場コストが増えている",
      "排ガス・騒音への環境対応が求められている",
      "電動建設機械の初期投資が重い",
      "老朽化した機械の更新時期が近づいている",
    ];
  }
  if (t.includes("省力化") || t.includes("人手不足")) {
    return [
      "人手不足で現場が回らない",
      "設備の老朽化が生産性に影響している",
      "人件費の高騰を設備投資で乗り越えたい",
      "自動化・省人化を検討しているが資金が課題",
    ];
  }
  if (t.includes("IT") || t.includes("デジタル") || t.includes("DX")) {
    return [
      "業務のデジタル化が進んでいない",
      "紙・Excel管理からの脱却を検討している",
      "ITシステム導入の初期費用が負担",
      "社内のITリテラシーに不安がある",
    ];
  }
  if (t.includes("事業承継") || t.includes("承継")) {
    return [
      "後継者への経営移行を検討している",
      "M&Aによる売却・買収を視野に入れている",
      "承継後の新規事業展開に投資したい",
      "引き継ぎ後も事業を安定させたい",
    ];
  }
  return [
    "投資の自己負担を減らして事業を前進させたい",
    "使える補助金制度があるかどうか調べたい",
    "申請の手間や要件が複雑で踏み出せない",
    "採択後の実施・報告をどう進めるか不安",
  ];
}

function fallbackUseCases(
  nameText: string,
  industries: string[],
): Array<{ label: string; body: string; persona?: string }> {
  if (nameText.includes("建設機械") || nameText.includes("重機") || nameText.includes("電動化")) {
    return [
      {
        persona: "土木工事業",
        label: "【活用例】電動ショベル導入",
        body: "土木工事会社が、燃料費や騒音への対応を見据えて電動ショベルの導入を検討するケースです。初期投資の負担を抑えながら、環境対応を進める計画づくりに活用できます。",
      },
      {
        persona: "解体工事業",
        label: "【活用例】電動重機への切替",
        body: "住宅密集地での作業が多い解体工事業者が、排ガスや騒音に配慮した電動重機へ切り替えるケースです。発注者や近隣への説明もしやすくなります。",
      },
      {
        persona: "建機レンタル会社",
        label: "【活用例】電動機械の貸出体制",
        body: "建機レンタル会社が、環境対応ニーズに合わせて電動建設機械のラインナップを整えるケースです。顧客の脱炭素対応を支える投資として整理できます。",
      },
    ];
  }

  const base = industries[0] ?? "中小企業";
  return [
    {
      persona: base,
      label: `【活用例】${base}の設備更新`,
      body: `老朽化した設備の更新に活用し、自己負担を抑えながら生産効率の改善を目指すケースです。`,
    },
    {
      persona: "業務効率化",
      label: "【活用例】業務効率化の推進",
      body: `受発注・在庫管理をシステム化し、手作業の削減と人手不足対策につなげるケースです。`,
    },
    {
      persona: "投資計画の見直し",
      label: "【活用例】投資計画の整理",
      body: "補助対象経費や導入時期を整理し、自己負担と投資効果のバランスを見ながら無理のない事業計画に落とし込むケースです。",
    },
  ];
}

function resolveUseCases(
  aiUseCases: LpAiPayload["useCases"],
  name: string,
  industries: string[],
): Array<{ label: string; body: string; persona?: string }> {
  const fallback = fallbackUseCases(name, industries);
  const normalized =
    Array.isArray(aiUseCases)
      ? aiUseCases
          .filter((u) => u.label && u.body)
          .map((u) => ({
            label: sanitizeUseCaseText(u.label!),
            body: sanitizeUseCaseText(u.body!),
            persona: u.persona?.trim() || undefined,
          }))
          .filter((u) => u.label && u.body)
      : [];

  const merged = [...normalized, ...fallback].map((u) => ({
    ...u,
    label: sanitizeUseCaseText(u.label),
    body: sanitizeUseCaseText(u.body),
  }));

  const seen = new Set<string>();
  const seenPersonas = new Set<string>();
  return merged
    .filter((u) => {
      const key = `${u.persona ?? ""}:${u.label}`;
      if (seen.has(key)) return false;
      if (u.persona && seenPersonas.has(u.persona)) return false;
      seen.add(key);
      if (u.persona) seenPersonas.add(u.persona);
      return true;
    })
    .slice(0, 3);
}

function fallbackFaqs(): Array<{ q: string; a: string }> {
  return [
    {
      q: "どんな企業が対象ですか？",
      a: "中小企業・小規模事業者が主な対象です。業種・規模・地域によって要件が異なるため、公募要領でご確認ください。",
    },
    {
      q: "補助金はいつ受け取れますか？",
      a: "一般的に、採択後に事業を実施し、完了報告・確定検査を経て入金となります。先払いではないケースがほとんどです。",
    },
    {
      q: "申請は自分でできますか？",
      a: "公募要領の確認・事業計画書の作成など、準備に時間がかかります。NTSでは戦略設計から伴走支援を行っています。",
    },
    {
      q: "採択率はどのくらいですか？",
      a: "補助金の種類や年度によって異なります。事業計画書の内容が採択の鍵となるため、早めの準備が重要です。",
    },
  ];
}

// ─────────────────────────────────────────────
// メインビルダー
// ─────────────────────────────────────────────

export function buildSubsidyLpData(
  grant: SubsidyGrant & { contents?: GeneratedContent[] },
  lpContent: GeneratedContent | null,
): SubsidyLpData {
  const raw = toRaw(grant.rawPayload);
  const name = grant.name ?? str(raw, "title") ?? "補助金制度";
  const institutionName =
    str(raw, "institution_name") ?? "所管省庁・機関";
  const targetArea = normalizeTargetArea(
    grant.prefecture ??
    str(raw, "target_area_search") ??
    grant.targetIndustryNote ??
    "全国",
  );
  const acceptanceStart = formatDateJP(str(raw, "acceptance_start_datetime"));
  const deadlineStr =
    grant.deadlineLabel ??
    str(raw, "acceptance_end_datetime") ??
    null;
  const deadlineDisplay = formatDateJP(deadlineStr ?? grant.deadline);
  const remaining = calcRemainingDays(deadlineStr, grant.deadline ?? null);
  const officialUrl = str(raw, "front_subsidy_detail_page_url");

  // AI コピー解決
  const ai = parseLpAiPayload(lpContent);

  const heroCopy =
    ai?.heroCopy?.trim() ||
    `${name}で、経営課題を解決しませんか`;
  const subCopy =
    ai?.subCopy?.trim() ||
    `補助率・上限額・申請方法をわかりやすく解説。まずは無料相談からどうぞ。`;

  const pains =
    Array.isArray(ai?.pains) && ai.pains.length >= 2
      ? ai.pains.slice(0, 5)
      : fallbackPains(name);

  const useCases = resolveUseCases(ai?.useCases, name, grant.targetIndustries ?? []);

  const faqs =
    Array.isArray(ai?.faqs) && ai.faqs.length >= 2
      ? ai.faqs
          .filter((f) => f.q && f.a)
          .map((f) => ({ q: f.q!, a: f.a! }))
          .slice(0, 5)
      : fallbackFaqs();

  return {
    id: grant.id,
    name,
    institutionName,
    amountValue: resolveAmountValue(grant.maxAmountLabel ?? null, raw, grant.subsidyAmount ?? null),
    amountLabel: resolveAmount(grant.maxAmountLabel ?? null, raw),
    rateLabel: resolveRate(raw, grant.subsidyRate != null ? String(grant.subsidyRate) : null),
    deadlineLabel: deadlineDisplay,
    remainingDays: remaining,
    targetArea,
    acceptanceStart,
    officialUrl,
    heroCopy,
    subCopy,
    pains,
    useCases,
    faqs,
    updatedAtLabel: formatDateJP(grant.updatedAt),
  };
}
