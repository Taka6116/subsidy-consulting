import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SUBSIDIES = [
  {
    id: "static-shoryokuka-catalog",
    title: "中小企業省力化投資補助金（カタログ注文型）",
    summary: "人手不足に悩む中小企業が、登録されたカタログ製品（配膳ロボット・清掃ロボット・自動精算機・POSシステム等）を導入する際の費用を補助。補助率1/2、随時申請可能。",
    subsidy_max_limit: 10000000,
    subsidy_rate: "1/2",
    target_area_search: "全国",
    target_number_of_employees: "300名以下",
    acceptance_status: "随時受付中",
    acceptance_end_datetime: null,
    target_themes: ["人手不足", "省力化", "ロボット導入", "自動化", "生産性向上"],
    excluded_industries: [],
    official_url: "https://shoryokuka.smrj.go.jp/",
    institution_name: "中小企業省力化投資補助金",
  },
  {
    id: "static-shoryokuka-general",
    title: "中小企業省力化投資補助金（一般型）",
    summary: "カタログにない独自のシステム開発・オーダーメイド設備も対象。IoT・AI・ロボット等を活用した省力化投資を支援。補助率1/2、補助上限最大1億円。",
    subsidy_max_limit: 100000000,
    subsidy_rate: "1/2",
    target_area_search: "全国",
    target_number_of_employees: "2000名以下",
    acceptance_status: "公募中（年複数回）",
    acceptance_end_datetime: null,
    target_themes: ["人手不足", "省力化", "システム開発", "自動化", "DX", "生産性向上"],
    excluded_industries: [],
    official_url: "https://shoryokuka.smrj.go.jp/ippan/",
    institution_name: "中小企業省力化投資補助金",
  },
  {
    id: "static-digital-ai-hojo",
    title: "デジタル化・AI導入補助金2026（旧：IT導入補助金）",
    summary: "業務管理システム・会計ソフト・AIツール・クラウドサービス等のITツール導入費用を補助。補助率1/2〜4/5、補助上限最大450万円。",
    subsidy_max_limit: 4500000,
    subsidy_rate: "1/2〜4/5",
    target_area_search: "全国",
    target_number_of_employees: "制約なし",
    acceptance_status: "受付中",
    acceptance_end_datetime: new Date("2026-05-12T08:00:00.000Z"),
    target_themes: ["IT導入", "デジタル化", "AI活用", "業務効率化", "DX", "会計ソフト", "クラウド"],
    excluded_industries: [],
    official_url: "https://it-shien.smrj.go.jp/",
    institution_name: "デジタル化・AI導入補助金",
  },
  {
    id: "static-monozukuri",
    title: "ものづくり・商業・サービス生産性向上促進補助金（20次締切）",
    summary: "革新的な製品・サービス開発や生産プロセス改善のための設備投資を支援。製造業だけでなく飲食・サービス業も対象。補助率1/2〜2/3、補助上限最大3,500万円。",
    subsidy_max_limit: 35000000,
    subsidy_rate: "1/2〜2/3",
    target_area_search: "全国",
    target_number_of_employees: "制約なし",
    acceptance_status: "受付中",
    acceptance_end_datetime: new Date("2026-12-28T08:00:00.000Z"),
    target_themes: ["設備投資", "生産性向上", "革新的サービス", "製造", "DX", "グリーン"],
    excluded_industries: [],
    official_url: "https://portal.monodukuri-hojo.jp/",
    institution_name: "ものづくり補助金",
  },
  {
    id: "static-jizokuka-sogyo",
    title: "小規模事業者持続化補助金〈創業型〉第3回",
    summary: "創業後5年未満の小規模事業者が販路開拓・業務効率化に取り組む費用を補助。チラシ・ウェブサイト・展示会・機器導入等が対象。補助率2/3、補助上限200万円。",
    subsidy_max_limit: 2000000,
    subsidy_rate: "2/3",
    target_area_search: "全国",
    target_number_of_employees: "20名以下",
    acceptance_status: "受付中",
    acceptance_end_datetime: new Date("2026-04-30T08:00:00.000Z"),
    target_themes: ["創業", "販路開拓", "小規模事業者", "チラシ", "ウェブサイト", "展示会"],
    excluded_industries: [],
    official_url: "https://r3.jizokukahojokin.info/",
    institution_name: "小規模事業者持続化補助金",
  },
  {
    id: "static-jigyoshokei",
    title: "事業承継・引継ぎ補助金",
    summary: "事業承継・M&Aを契機とした経営革新や廃業・再チャレンジ費用を補助。後継者不在の中小企業の事業承継を後押し。補助率1/2〜2/3、補助上限最大800万円。",
    subsidy_max_limit: 8000000,
    subsidy_rate: "1/2〜2/3",
    target_area_search: "全国",
    target_number_of_employees: "制約なし",
    acceptance_status: "公募中（年複数回）",
    acceptance_end_datetime: null,
    target_themes: ["事業承継", "M&A", "後継者", "廃業", "経営革新", "引継ぎ"],
    excluded_industries: [],
    official_url: "https://jshojo.jp/",
    institution_name: "事業承継・引継ぎ補助金",
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Seeding static_subsidies...");
    for (const s of SUBSIDIES) {
      await client.query(
        `INSERT INTO static_subsidies (
          id, title, summary, subsidy_max_limit, subsidy_rate,
          target_area_search, target_number_of_employees,
          acceptance_status, acceptance_end_datetime,
          target_themes, excluded_industries, official_url, institution_name
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          subsidy_max_limit = EXCLUDED.subsidy_max_limit,
          acceptance_end_datetime = EXCLUDED.acceptance_end_datetime,
          acceptance_status = EXCLUDED.acceptance_status,
          updated_at = NOW()`,
        [
          s.id, s.title, s.summary, s.subsidy_max_limit, s.subsidy_rate,
          s.target_area_search, s.target_number_of_employees,
          s.acceptance_status, s.acceptance_end_datetime ?? null,
          s.target_themes, s.excluded_industries, s.official_url, s.institution_name,
        ]
      );
      console.log(`  ✓ ${s.title}`);
    }
    console.log("Done.");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
