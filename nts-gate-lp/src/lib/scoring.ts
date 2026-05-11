import type {
  DiagnosisAnswers,
  DiagnosisMode,
  DiagnosisResult,
  MatchedSubsidy,
} from "@/types/diagnosis";
import { SUBSIDIES } from "@/lib/subsidyData";

/** エンドユーザー向けスコアの理論上の最大（50+20+15+15） */
export const SCORE_MAX_END_USER = 100;

/** 提携先向けスコアの理論上の最大（60+25+15） */
export const SCORE_MAX_PARTNER = 100;

/**
 * 生スコアを 0〜100% の表示用マッチ度に正規化する
 */
export function normalizeMatchDisplayPercent(
  rawScore: number,
  mode: DiagnosisMode,
): number {
  const max = mode === "partner" ? SCORE_MAX_PARTNER : SCORE_MAX_END_USER;
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((rawScore / max) * 100)));
}

const CHALLENGE_LABELS: Record<string, string> = {
  labor_shortage: "人手不足・採用の効率化",
  equipment: "設備投資・生産性向上",
  succession: "事業承継・後継者問題",
  dx: "IT・DX・業務効率化",
  other: "その他の経営課題",
};

/** FV見出し: `御社の{これ}、補助金で動かせます。` */
const CHALLENGE_HERO_PROGRESS_PHRASE: Record<string, string> = {
  labor_shortage: "人手不足の解消",
  equipment: "設備投資・生産性向上",
  dx: "IT・DX推進",
  succession: "事業承継",
  other: "経営課題",
};

/** 制度カード上部: `{これ} に使える制度` */
const CHALLENGE_CARD_CONTEXT_LABEL: Record<string, string> = {
  labor_shortage: "人手不足の解消 に使える制度",
  equipment: "設備投資・生産性向上 に使える制度",
  dx: "IT・DX推進 に使える制度",
  succession: "事業承継 に使える制度",
  other: "御社の課題に使える制度",
};

export const END_USER_HERO_FALLBACK_PHRASE = "経営課題";
export const SUBSIDY_CARD_CONTEXT_FALLBACK = "御社の課題に使える制度";

const EMP_LABELS: Record<string, string> = {
  under20: "20名以下",
  "21to100": "21〜100名",
  "101to300": "101〜300名",
  over300: "300名以上",
};

const TIMELINE_LABELS: Record<string, string> = {
  within3months: "3か月以内に動きたい",
  within6months: "6か月以内に動きたい",
  within1year: "1年以内を目安に",
  undecided: "時期は未定",
};

const INVESTMENT_LABELS: Record<string, string> = {
  under500: "500万円未満",
  "500to2000": "500〜2,000万円",
  "2000to5000": "2,000〜5,000万円",
  over5000: "5,000万円以上",
};

const PRODUCT_LABELS: Record<string, string> = {
  iot_automation: "IoT・自動化設備",
  it_software: "ITソフトウェア・SaaS",
  construction_equipment: "建設・製造設備",
  hr_system: "人事・労務システム",
  other: "その他",
};

const CUSTOMER_SIZE_LABELS: Record<string, string> = {
  small: "小規模（〜20名）",
  medium: "中小企業（20〜300名）",
  large: "大企業（300名以上）",
};

function scoreEndUser(a: DiagnosisAnswers): MatchedSubsidy[] {
  return SUBSIDIES.map((s) => {
    let score = 0;
    const reasons: string[] = [];

    if (a.challenge && s.targetChallenges.includes(a.challenge)) {
      score += 50;
      reasons.push(
        `${CHALLENGE_LABELS[a.challenge] ?? "経営課題"}を課題としているためマッチ度が高い`,
      );
    }

    if (a.employeeCount === "21to100" || a.employeeCount === "101to300") {
      score += 20;
      reasons.push("中小企業向けの補助制度のため規模感が合致");
    }

    if (a.timeline === "within3months" || a.timeline === "within6months") {
      score += 15;
      reasons.push("申請を検討されているため今すぐ動ける制度をご案内");
    }

    if (
      a.investmentAmount &&
      ["500to2000", "2000to5000", "over5000"].includes(a.investmentAmount)
    ) {
      score += 15;
      reasons.push("投資規模が補助金の対象額と合致");
    }

    return { subsidy: s, matchScore: score, matchReasons: reasons };
  })
    .filter((m) => m.matchScore >= 30)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

function scorePartner(a: DiagnosisAnswers): MatchedSubsidy[] {
  return SUBSIDIES.map((s) => {
    let score = 0;
    const reasons: string[] = [];

    if (a.productCategory && s.targetProducts.includes(a.productCategory)) {
      score += 60;
      reasons.push(
        `${PRODUCT_LABELS[a.productCategory] ?? "商材"}が対象制度に該当する可能性が高い`,
      );
    }

    if (
      a.mainCustomerSize === "small" ||
      a.mainCustomerSize === "medium"
    ) {
      score += 25;
      reasons.push("主な顧客が中小企業であるため補助金の対象規模に合致");
    }

    if (a.currentlyProposing) {
      score += 15;
      reasons.push("既にお客様へ提案中のため補助金で後押しが可能");
    }

    return { subsidy: s, matchScore: score, matchReasons: reasons };
  })
    .filter((m) => m.matchScore >= 40)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

export function computeResult(answers: DiagnosisAnswers): DiagnosisResult {
  const isPartner = answers.mode === "partner";
  const rawMatched = isPartner ? scorePartner(answers) : scoreEndUser(answers);
  const matched = rawMatched.map((m) => ({
    ...m,
    matchScore: normalizeMatchDisplayPercent(m.matchScore, answers.mode),
  }));

  const summaryItems = isPartner
    ? [
        {
          label: "商材カテゴリ",
          value: PRODUCT_LABELS[answers.productCategory ?? ""] ?? "未選択",
        },
        {
          label: "主な顧客規模",
          value:
            CUSTOMER_SIZE_LABELS[answers.mainCustomerSize ?? ""] ?? "未選択",
        },
        {
          label: "補助金対象可能性",
          value:
            matched.length >= 2
              ? "高い（複数制度に該当）"
              : matched.length === 1
                ? "あり（1制度に該当）"
                : "要確認",
        },
      ]
    : [
        {
          label: "ご利用イメージ",
          value: CHALLENGE_LABELS[answers.challenge ?? ""] ?? "未選択",
        },
        {
          label: "従業員規模",
          value: EMP_LABELS[answers.employeeCount ?? ""] ?? "未選択",
        },
        {
          label: "動きたいタイミング",
          value: TIMELINE_LABELS[answers.timeline ?? ""] ?? "未選択",
        },
        {
          label: "投資規模の目安",
          value: INVESTMENT_LABELS[answers.investmentAmount ?? ""] ?? "未選択",
        },
      ];

  const nextSteps = isPartner
    ? [
        {
          title: "提携契約（無料・即日〜）",
          description:
            "MOU締結後、紹介用の診断ツールURLと営業資料一式をご提供します",
        },
        {
          title: "お客様に診断ツールを渡すだけ",
          description:
            '"補助金が使えるか確認してみてください"とURLを共有。あとはNTSが対応します',
        },
        {
          title: "採択確定で紹介フィーをお支払い",
          description:
            "採択後の流れとタイミングに沿って、個別にご案内いたします。",
        },
      ]
    : [
        {
          title: "無料相談（30分）",
          description:
            "経営課題と現状をヒアリングし、活用すべき制度と優先順位を整理します。",
        },
        {
          title: "活用戦略の設計と申請サポート",
          description:
            "「どの制度を、いつ動かすか」から設計。申請準備の情報整理から採択後の活用まで一貫支援。",
        },
        {
          title: "採択後の実行まで伴走",
          description:
            "着手金15万円＋成果連動フィー制。採択されなければ追加のコンサルティングフィーは原則発生しません。",
        },
      ];

  const challengeKey = answers.challenge ?? "other";
  const endUserHeroProgressPhrase = !isPartner
    ? CHALLENGE_HERO_PROGRESS_PHRASE[challengeKey] ?? END_USER_HERO_FALLBACK_PHRASE
    : undefined;

  const productKey = answers.productCategory ?? "other";
  const productLabel = PRODUCT_LABELS[productKey] ?? "";
  const subsidyCardContextLabel = isPartner
    ? productLabel && productKey !== "other"
      ? `${productLabel} に使える制度`
      : SUBSIDY_CARD_CONTEXT_FALLBACK
    : CHALLENGE_CARD_CONTEXT_LABEL[challengeKey] ?? SUBSIDY_CARD_CONTEXT_FALLBACK;

  return {
    mode: answers.mode,
    matchedSubsidies: matched,
    summaryItems,
    nextSteps,
    endUserHeroProgressPhrase,
    subsidyCardContextLabel,
  };
}

export function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
): DiagnosisAnswers {
  const get = (key: string) => {
    const v = params[key];
    return typeof v === "string" ? v : undefined;
  };

  const mode = get("mode") === "partner" ? "partner" : "end_user";

  return {
    mode,
    challenge: get("challenge") as DiagnosisAnswers["challenge"],
    employeeCount: get("employeeCount") as DiagnosisAnswers["employeeCount"],
    timeline: get("timeline") as DiagnosisAnswers["timeline"],
    investmentAmount: get("investmentAmount") as DiagnosisAnswers["investmentAmount"],
    industry: get("industry") as DiagnosisAnswers["industry"],
    productCategory: get("productCategory") as DiagnosisAnswers["productCategory"],
    mainCustomerSize: get("mainCustomerSize") as DiagnosisAnswers["mainCustomerSize"],
    currentlyProposing: get("currentlyProposing") === "true",
  };
}
