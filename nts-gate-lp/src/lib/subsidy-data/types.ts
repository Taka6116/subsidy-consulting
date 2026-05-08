export type SubsidyLpData = {
  id: string;
  heroImagePath?: string | null;
  badge: string;
  category: string;
  headline: string;
  headlineAccent: string;
  subheadline: string;
  benefits: Array<{ icon: string; label: string }>;
  dates: {
    start: string;
    deadline: string;
    remainingDays: number;
    maxAmount: string;
  };
  targetChecklist: string[];
  targetIndustries: Array<{ label: string; desc: string }>;
  beforeAfter: {
    before: string[];
    after: string[];
  };
  caseStudies: Array<{
    industry: string;
    result: string;
    detail: string;
    amount: string;
  }>;
  flow: Array<{
    step: string;
    title: string;
    desc: string;
  }>;
  stats: Array<{
    value: string;
    label: string;
    suffix?: string;
  }>;
};
