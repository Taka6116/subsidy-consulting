/**
 * jGrants 補助金情報取得API クライアント
 * ベースURL: https://api.jgrants-portal.go.jp/exp
 * 認証不要（パブリックAPI）
 */

const JGRANTS_BASE_URL = "https://api.jgrants-portal.go.jp/exp";

/** 業種ID（UI内部）→ jGrants API の industry 文字列 マッピング */
export const INDUSTRY_ID_TO_JGRANTS: Record<string, string> = {
  agriculture:        "農業、林業",
  fishery:            "漁業",
  mining:             "鉱業、採石業、砂採取業",
  construction:       "建設業",
  manufacturing:      "製造業",
  electric_equipment: "製造業",
  food_manufacturing: "製造業",
  retail:             "卸売業、小売業",
  motor_vehicle:      "卸売業、小売業",
  transport:          "運輸業、郵便業",
  warehousing:        "運輸業、郵便業",
  it_services:        "情報通信業",
  software_saas:      "情報通信業",
  finance:            "金融業、保険業",
  real_estate:        "不動産業、物品賃貸業",
  professional:       "学術研究、専門・技術サービス業",
  advertising_pr:     "学術研究、専門・技術サービス業",
  consulting:         "学術研究、専門・技術サービス業",
  accommodation:      "宿泊業、飲食サービス業",
  education:          "教育、学習支援業",
  education_training: "教育、学習支援業",
  health:             "医療、福祉",
  arts_entertainment: "芸術、娯楽及びレクリエーション業",
  lifestyle_services: "生活関連サービス業、娯楽業",
  temp_staffing:      "サービス業（他に分類されないもの）",
  call_center_bpo:    "サービス業（他に分類されないもの）",
  services_other:     "サービス業（他に分類されないもの）",
  energy:             "電気・ガス・熱供給・水道業",
  waste_environment:  "廃棄物処理業",
  other:              "",
};

/** 一覧APIのレスポンス（1件分） */
export type JGrantsSubsidySummary = {
  id: string;
  name: string;
  title: string;
  target_area_search?: string;
  subsidy_max_limit?: number;
  acceptance_start_datetime?: string;
  acceptance_end_datetime?: string;
  target_number_of_employees?: string;
  institution_name?: string;
};

/** 詳細APIのレスポンス（1件分） */
export type JGrantsSubsidyDetail = JGrantsSubsidySummary & {
  subsidy_catch_phrase?: string;
  detail?: string;
  use_purpose?: string;
  industry?: string;
  subsidy_rate?: string;
  target_area_detail?: string;
  front_subsidy_detail_page_url?: string;
};

type JGrantsListResponse = {
  metadata: { resultset: { count: number; limit: number; offset: number } };
  result: JGrantsSubsidySummary[];
};

type JGrantsDetailResponse = {
  metadata: unknown;
  result: JGrantsSubsidyDetail[];
};

/**
 * 募集終了日時が「現在以降」なら true。
 * 未設定・パース不能は true（acceptance=1 取得との併用で過剰除外を避ける）。
 */
export function isSubsidyAcceptanceEndOpen(
  endDatetime?: string | null,
  nowMs: number = Date.now(),
): boolean {
  if (endDatetime == null || !String(endDatetime).trim()) return true;
  const t = Date.parse(endDatetime);
  if (Number.isNaN(t)) return true;
  return t >= nowMs;
}

/**
 * 補助金一覧を取得する。
 * @param acceptance "1"=募集中のみ、"0"=全件（終了済み含む）
 */
export async function fetchSubsidyList(params: {
  industryId?: string;
  keyword?: string;
  limit?: number;
  acceptance?: "0" | "1";
  /** 照合API等：鮮度優先でキャッシュしない */
  cache?: RequestCache;
}): Promise<JGrantsSubsidySummary[]> {
  const { industryId, keyword, limit = 20, acceptance = "0", cache } = params;

  const industry = industryId ? (INDUSTRY_ID_TO_JGRANTS[industryId] ?? "") : "";
  // keyword が未指定の場合は業種名をキーワードとして使う（必須パラメータのため）
  const kw = keyword?.trim() || industry || "補助金";

  const query = new URLSearchParams({
    keyword: kw,
    sort: "acceptance_end_datetime",
    order: "DESC",
    acceptance,
  });

  if (industry) {
    query.set("industry", industry);
  }

  const url = `${JGRANTS_BASE_URL}/v1/public/subsidies?${query.toString()}`;
  console.log("[jgrants] list request:", url);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      ...(cache === "no-store"
        ? { cache: "no-store" as RequestCache }
        : { next: { revalidate: 3600 } }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[jgrants] list fetch failed", res.status, text.slice(0, 200));
      return [];
    }

    const json = (await res.json()) as JGrantsListResponse;
    const all = json.result ?? [];
    console.log("[jgrants] list total:", all.length, "→ limit:", limit);
    return all.slice(0, limit);
  } catch (e) {
    console.error("[jgrants] list fetch error:", e);
    return [];
  }
}

/**
 * 複数 keyword で一覧を取り、id でユニオンする。募集終了日の降順で整列。
 */
export async function fetchSubsidyListUnion(params: {
  industryId?: string;
  keywords: string[];
  perQueryLimit: number;
  acceptance: "0" | "1";
  cache?: RequestCache;
}): Promise<JGrantsSubsidySummary[]> {
  const { industryId, keywords, perQueryLimit, acceptance, cache } = params;
  const seen = new Set<string>();
  const map = new Map<string, JGrantsSubsidySummary>();

  for (const keyword of keywords) {
    const k = keyword.trim();
    if (!k) continue;
    const list = await fetchSubsidyList({
      industryId,
      keyword: k,
      limit: perQueryLimit,
      acceptance,
      cache,
    });
    for (const s of list) {
      if (!s.id || seen.has(s.id)) continue;
      seen.add(s.id);
      map.set(s.id, s);
    }
  }

  const merged = [...map.values()];
  merged.sort((a, b) =>
    (b.acceptance_end_datetime ?? "").localeCompare(a.acceptance_end_datetime ?? ""),
  );
  return merged;
}

/**
 * 補助金詳細を取得する。
 * 正しいエンドポイント: /v1/public/subsidies/id/{id}
 */
export async function fetchSubsidyDetail(
  subsidyId: string,
  options?: { cache?: RequestCache },
): Promise<JGrantsSubsidyDetail | null> {
  // 正しいパス: /v1/public/subsidies/id/{id}
  const url = `${JGRANTS_BASE_URL}/v1/public/subsidies/id/${subsidyId}`;
  const cache = options?.cache;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      ...(cache === "no-store"
        ? { cache: "no-store" as RequestCache }
        : { next: { revalidate: 3600 } }),
    });

    if (!res.ok) {
      console.error("[jgrants] detail fetch failed", subsidyId, res.status);
      return null;
    }

    const json = (await res.json()) as JGrantsDetailResponse;
    return json.result?.[0] ?? null;
  } catch (e) {
    console.error("[jgrants] detail fetch error:", subsidyId, e);
    return null;
  }
}

/** 補助額を日本語表記に変換 */
export function formatMaxAmount(amount?: number): string {
  if (!amount) return "—";
  if (amount >= 100_000_000) return `最大${Math.round(amount / 100_000_000)}億円`;
  if (amount >= 10_000) return `最大${Math.round(amount / 10_000)}万円`;
  return `最大${amount.toLocaleString()}円`;
}

/** 募集期限を日本語表記に変換 */
export function formatDeadline(endDatetime?: string): string {
  if (!endDatetime) return "—";
  try {
    const d = new Date(endDatetime);
    if (d.getFullYear() >= 2027) return "—";
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  } catch {
    return "—";
  }
}
