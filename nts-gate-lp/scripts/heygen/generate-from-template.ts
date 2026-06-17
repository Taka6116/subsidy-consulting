/**
 * HeyGen Template API を使ったスライド動画自動生成スクリプト
 * 実行: npx tsx scripts/heygen/generate-from-template.ts [subsidyId]
 *
 * 動作:
 *   1. DB から補助金データを1件取得（引数で subsidyId 指定可、未指定は最新公募中）
 *   2. 5シーン（Hook / What / Numbers / UseCase / CTA）分の変数を組み立て
 *   3. HeyGen Template API で動画生成リクエスト
 *   4. ステータスをポーリングして video_url を取得・表示
 *
 * 必要な環境変数:
 *   HEYGEN_API_KEY            — HeyGen API キー
 *   HEYGEN_SLIDE_TEMPLATE_ID  — スライド動画用テンプレートID（新テンプレート）
 *                               未設定時は HEYGEN_TEMPLATE_ID にフォールバック
 *
 * テンプレート作成手順: docs/heygen-slide-template-setup.md
 */

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { prisma } from "@/lib/db/prisma";
import {
  cleanSubsidyName,
  cleanSubsidyDescription,
} from "@/lib/subsidyCheckResultHelpers";

// ─────────────────────────────────────────────────────────────
// 設定
// ─────────────────────────────────────────────────────────────
const API_KEY = process.env.HEYGEN_API_KEY ?? "";
const TEMPLATE_ID =
  process.env.HEYGEN_SLIDE_TEMPLATE_ID ??
  process.env.HEYGEN_TEMPLATE_ID ??
  "";

if (!API_KEY) {
  console.error("❌ HEYGEN_API_KEY が .env に設定されていません。");
  process.exit(1);
}
if (!TEMPLATE_ID) {
  console.error(
    "❌ HEYGEN_SLIDE_TEMPLATE_ID（または HEYGEN_TEMPLATE_ID）が .env に設定されていません。",
  );
  process.exit(1);
}

const HEADERS = {
  "X-Api-Key": API_KEY,
  "Content-Type": "application/json",
} as const;

/** サイトのベースURL（CTA に表示） */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "subsidy.nihon-teikei.co.jp";

// ─────────────────────────────────────────────────────────────
// DB から補助金データを取得
// ─────────────────────────────────────────────────────────────
type GrantRow = {
  id: string;
  name: string | null;
  description: string | null;
  maxAmountLabel: string | null;
  subsidyAmount: bigint | null;
  targetIndustryNote: string | null;
  targetIndustries: string[];
  deadlineLabel: string | null;
  deadline: Date | null;
  prefecture: string | null;
};

async function fetchGrant(subsidyId?: string): Promise<GrantRow> {
  const select = {
    id: true,
    name: true,
    description: true,
    maxAmountLabel: true,
    subsidyAmount: true,
    targetIndustryNote: true,
    targetIndustries: true,
    deadlineLabel: true,
    deadline: true,
    prefecture: true,
  } as const;

  if (subsidyId) {
    const grant = await prisma.subsidyGrant.findUnique({
      where: { id: subsidyId },
      select,
    });
    if (!grant) throw new Error(`SubsidyGrant not found: ${subsidyId}`);
    return grant;
  }

  // 未指定時: 公募中の最新1件
  const grant = await prisma.subsidyGrant.findFirst({
    where: { status: { in: ["open", "upcoming"] } },
    orderBy: [{ deadline: "asc" }, { syncedAt: "desc" }],
    select,
  });
  if (!grant) throw new Error("公募中の補助金が DB に見つかりませんでした。");
  return grant;
}

// ─────────────────────────────────────────────────────────────
// 補助金データ → テンプレート6変数を組み立て
// テンプレート変数: s1_title / s2_body / s3_amount / s3_deadline / s4_case1 / s4_case2
// ─────────────────────────────────────────────────────────────
type SceneVars = {
  s1_title: string;
  s2_body: string;
  s3_amount: string;
  s3_deadline: string;
  s4_case1: string;
  s4_case2: string;
};

function buildSceneVars(grant: GrantRow): SceneVars {
  const name = cleanSubsidyName(grant.name ?? "補助金制度");
  const description =
    cleanSubsidyDescription(grant.description) ||
    "中小企業の経営課題解決を支援する補助制度です。";

  // 補助上限額
  const amount = grant.maxAmountLabel
    ? grant.maxAmountLabel.startsWith("最大")
      ? grant.maxAmountLabel
      : `最大 ${grant.maxAmountLabel}`
    : grant.subsidyAmount
      ? `最大 ${Math.round(Number(grant.subsidyAmount) / 10_000).toLocaleString("ja-JP")}万円`
      : "最大数百万円規模";

  // 申請期限
  let deadline = "公募中";
  if (grant.deadlineLabel) {
    deadline = grant.deadlineLabel;
  } else if (grant.deadline) {
    const d = new Date(String(grant.deadline));
    if (!isNaN(d.getTime())) {
      deadline = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }
  }

  // 対象業種
  const industries =
    grant.targetIndustryNote && grant.targetIndustryNote.length < 60
      ? grant.targetIndustryNote
      : grant.targetIndustries.length > 0
        ? grant.targetIndustries.slice(0, 3).join("・") + "など"
        : "中小企業全般";

  // 活用事例（業種に合わせて生成）
  const hasCons = /建設/.test(industries);
  const hasTrans = /運輸|物流/.test(industries);
  const case1 = hasCons
    ? "重機・設備更新費用への補助活用"
    : hasTrans
      ? "配送管理システム導入費用に活用"
      : "IT化・省力化設備の導入費用に活用";
  const case2 = "経営の選択肢を広げる第一歩として";

  // s2_body: 制度概要（改行で読みやすく、最大100文字）
  const bodyText = description.length > 80
    ? description.slice(0, 78) + "…"
    : description;

  return {
    // シーン1: 補助金名（タイトル）短めに収める
    s1_title: name.slice(0, 20),

    // シーン3（テンプレート上シーン2）: 制度概要
    s2_body: bodyText,

    // シーン4（テンプレート上シーン3）: 金額・期限
    s3_amount: amount,
    s3_deadline: `申請期限：${deadline}`,

    // シーン5（テンプレート上シーン4）: 活用事例
    s4_case1: case1,
    s4_case2: case2,
  };
}

// ─────────────────────────────────────────────────────────────
// HeyGen 変数オブジェクトに変換
// ─────────────────────────────────────────────────────────────
function toHeyGenVariables(
  vars: SceneVars,
): Record<string, { name: string; type: "text"; properties: { content: string } }> {
  return Object.fromEntries(
    Object.entries(vars).map(([key, value]) => [
      key,
      { name: key, type: "text" as const, properties: { content: value } },
    ]),
  );
}

// ─────────────────────────────────────────────────────────────
// Step 1: テンプレートから動画生成
// ─────────────────────────────────────────────────────────────
async function generateFromTemplate(
  vars: SceneVars,
  title: string,
  testMode: boolean,
): Promise<string> {
  console.log("\n━━━ Step 1: テンプレート動画生成リクエスト ━━━");
  console.log(`  template_id : ${TEMPLATE_ID}`);
  console.log(`  title       : ${title}`);
  console.log(`  test mode   : ${testMode}（${testMode ? "クレジット消費なし" : "本番生成"}）`);
  console.log("\n  変数:");
  for (const [k, v] of Object.entries(vars)) {
    console.log(`    ${k.padEnd(18)}: ${String(v).slice(0, 50)}${String(v).length > 50 ? "..." : ""}`);
  }

  const body = {
    test: testMode,
    caption: false,
    title,
    variables: toHeyGenVariables(vars),
  };

  const res = await fetch(
    `https://api.heygen.com/v2/template/${TEMPLATE_ID}/generate`,
    {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
    },
  );

  const json = (await res.json()) as {
    data?: { video_id?: string };
    error?: unknown;
  };

  if (!res.ok || !json.data?.video_id) {
    throw new Error(
      `動画生成APIエラー: ${res.status} ${JSON.stringify(json)}`,
    );
  }

  const videoId = json.data.video_id;
  console.log(`\n✅ video_id: ${videoId}`);
  return videoId;
}

// ─────────────────────────────────────────────────────────────
// Step 2: ステータスポーリング
// ─────────────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollStatus(videoId: string): Promise<void> {
  console.log(
    `\n━━━ Step 2: ステータス確認ポーリング (video_id: ${videoId}) ━━━`,
  );

  const TIMEOUT_MS = 10 * 60 * 1000; // 10分
  const INTERVAL_MS = 8_000;
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < TIMEOUT_MS) {
    attempt++;
    await sleep(INTERVAL_MS);

    const res = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
      { headers: HEADERS },
    );
    const json = (await res.json()) as {
      data?: {
        status?: string;
        video_url?: string;
        thumbnail_url?: string;
        error?: string;
      };
    };
    const status = json.data?.status ?? "unknown";
    const elapsed = Math.round((Date.now() - start) / 1000);

    console.log(`  [${elapsed}s / ${attempt}回目] status: ${status}`);

    if (status === "completed") {
      console.log("\n━━━ 完了 ━━━");
      console.log(`  video_id      : ${videoId}`);
      console.log(`  video_url     : ${json.data?.video_url ?? "(なし)"}`);
      console.log(`  thumbnail_url : ${json.data?.thumbnail_url ?? "(なし)"}`);
      return;
    }

    if (status === "failed") {
      console.error(`\n❌ 動画生成失敗`);
      console.error(`  error: ${json.data?.error ?? "(詳細なし)"}`);
      process.exit(1);
    }
  }

  console.error(
    `\n⏱️  タイムアウト（10分）。video_id: ${videoId} を HeyGen ダッシュボードで確認してください。`,
  );
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────
// メイン
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   HeyGen スライド動画 自動生成  NTS                 ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  // コマンドライン引数から subsidyId と --production フラグを取得
  const args = process.argv.slice(2);
  const subsidyId = args.find((a) => !a.startsWith("--"));
  const testMode = !args.includes("--production");

  if (testMode) {
    console.log("\n⚡ テストモードで実行します（クレジット消費なし）");
    console.log("   本番生成する場合は --production フラグを付けてください\n");
  }

  console.log(`\n🔍 補助金データを取得中...`);
  const grant = await fetchGrant(subsidyId);
  const grantName = cleanSubsidyName(grant.name ?? "補助金制度");
  console.log(`✅ 取得: ${grantName} (id: ${grant.id})`);

  const vars = buildSceneVars(grant);
  const title = `NTS_${grantName.slice(0, 20)}_${new Date().toISOString().slice(0, 10)}`;

  const videoId = await generateFromTemplate(vars, title, testMode);
  await pollStatus(videoId);
}

main()
  .catch((err) => {
    console.error("予期しないエラー:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
