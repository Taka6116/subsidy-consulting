import { prisma } from "@/lib/db/prisma";

/** 一覧ページと同じ信頼ソース（list/page.tsx と一致） */
export const TRUSTED_SOURCES = ["jgrants", "municipality"] as const;

const NATIONWIDE_LABEL = "全国";

/** 一覧に掲載する補助金の基本条件 */
export const LISTED_GRANT_WHERE = {
  status: "open" as const,
  source: { in: [...TRUSTED_SOURCES] },
  name: { not: null },
};

// 47都道府県の正式名称セット（判定用）
const PREF_NAMES = new Set([
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県",
]);

/**
 * prefecture フィールドから都道府県名を抽出する。
 * 「北海道 / 宮城県 / ...」のようなスラッシュ区切りも個別に分解する。
 */
function extractPrefectures(prefecture: string | null): string[] {
  if (!prefecture) return [];
  const trimmed = prefecture.trim();
  if (!trimmed || trimmed.includes(NATIONWIDE_LABEL)) return [];

  // スラッシュ区切りで分割し、既知の都道府県名のみ抽出
  const parts = trimmed.split(/\s*\/\s*/);
  const found: string[] = [];
  for (const part of parts) {
    const p = part.trim();
    if (PREF_NAMES.has(p)) found.push(p);
  }
  // 単一で既知でなければそのまま返す（フォールバック）
  if (found.length === 0 && !trimmed.includes(NATIONWIDE_LABEL)) {
    return [trimmed];
  }
  return found;
}

export type PortalStats = {
  /** 一覧に表示される補助金件数（締切フィルタ前・source絞り込み後） */
  grantCount: number;
  /** 記事一覧に表示される解説記事数 */
  articleCount: number;
  /** 一覧掲載補助金に存在する都道府県数 */
  activePrefectureCount: number;
  /** 参考: 公開動画数 */
  videoCount: number;
  /** 参考: 公開LP数 */
  lpCount: number;
};

/**
 * ヒーロー統計 — 各一覧ページに実際に表示されている件数と同一定義
 */
export async function getPortalStats(): Promise<PortalStats> {
  const [listedGrants, articleCount, videoCount, lpCount] = await Promise.all([
    prisma.subsidyGrant.findMany({
      where: LISTED_GRANT_WHERE,
      select: { prefecture: true },
    }),
    prisma.generatedContent.count({
      where: {
        contentType: "article",
        status: "published",
        slug: { not: null },
        title: { not: null },
        grant: { is: { status: "open" } },
      },
    }),
    prisma.generatedContent.count({
      where: { contentType: "video", status: "published" },
    }),
    prisma.generatedContent.count({
      where: { contentType: "lp", status: "published" },
    }),
  ]);

  // 都道府県を正規化してユニーク数をカウント
  const prefectureSet = new Set<string>();
  for (const g of listedGrants) {
    for (const pref of extractPrefectures(g.prefecture)) {
      prefectureSet.add(pref);
    }
  }
  // 47都道府県を超えないようにキャップ
  const activePrefectureCount = Math.min(prefectureSet.size, 47);

  return {
    grantCount: listedGrants.length,   // 締切フィルタなし・一覧掲載条件のみ
    articleCount,
    activePrefectureCount,
    videoCount,
    lpCount,
  };
}
