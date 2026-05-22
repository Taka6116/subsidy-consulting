"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.58, ease: EASE_OUT, delay },
});

type IconType =
  | "relation"
  | "field"
  | "proposal"
  | "knowledge"
  | "strategy"
  | "network";

const partnerInputs: { type: IconType; text: string }[] = [
  { type: "relation", text: "お客様との信頼と関係性" },
  { type: "field", text: "現場の相談と課題の手触り" },
  { type: "proposal", text: "提案したい商材とサービス" },
];

const ntsInputs: { type: IconType; text: string }[] = [
  { type: "knowledge", text: "補助金活用の制度知見" },
  { type: "strategy", text: "投資背景を整理する設計力" },
  { type: "network", text: "専門家と実行支援の体制" },
];

const jointSteps = [
  {
    number: "01",
    title: "課題を深く捉える",
    body: "表面の相談だけでなく、投資背景と制約まで整理する。",
  },
  {
    number: "02",
    title: "選択肢を組み立てる",
    body: "補助金活用も含めて、提案が進む道筋を広げる。",
  },
  {
    number: "03",
    title: "前進につなげる",
    body: "御社の提案力を支え、お客様の意思決定を後押しする。",
  },
];

const supportTags = ["補助金活用の視点", "投資背景の整理", "専門家との連携"];

function InputIcon({ type }: { type: IconType }) {
  const iconClassName = "h-5 w-5";

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#eef4ff] text-[#1a56db]">
      {type === "relation" && (
        <svg viewBox="0 0 24 24" className={iconClassName} fill="none" aria-hidden>
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M3 19c.8-2.8 2.9-4.4 6-4.4 3 0 5.1 1.6 5.9 4.4M16.8 14.1c1.9.4 3.3 1.6 4 3.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      )}
      {type === "field" && (
        <svg viewBox="0 0 24 24" className={iconClassName} fill="none" aria-hidden>
          <path
            d="m12 3 8 6v11H4V9l8-6Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      )}
      {type === "proposal" && (
        <svg viewBox="0 0 24 24" className={iconClassName} fill="none" aria-hidden>
          <path
            d="M7 4h9l3 4-3 4H7V4Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M8 12v8M12 12v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
      {type === "knowledge" && (
        <svg viewBox="0 0 24 24" className={iconClassName} fill="none" aria-hidden>
          <path
            d="M12 4a6 6 0 0 0-3.3 11v2h6.6v-2A6 6 0 0 0 12 4Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path d="M9 20h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
      {type === "strategy" && (
        <svg viewBox="0 0 24 24" className={iconClassName} fill="none" aria-hidden>
          <path
            d="M4 19h16M7 19V9l5-5 5 5v10"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M10 19v-5h4v5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      )}
      {type === "network" && (
        <svg viewBox="0 0 24 24" className={iconClassName} fill="none" aria-hidden>
          <circle cx="12" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="5" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="19" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 7.2v4.2M10 12.3 6.4 17M14 12.3l3.6 4.7M8 19h8"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

function SourceCard({
  label,
  subtitle,
  accent,
  items,
}: {
  label: string;
  subtitle: string;
  accent: "blue" | "mint";
  items: { type: IconType; text: string }[];
}) {
  const accentClasses =
    accent === "mint"
      ? "border-[#bde3d8] bg-[#f4fcf9] text-[#0f765b]"
      : "border-[#bfd7ff] bg-[#f4f8ff] text-[#1a56db]";

  return (
    <div className="rounded-[22px] border border-[#ccdaef] bg-white/95 p-4 shadow-[0_18px_44px_-34px_rgba(10,49,105,0.45)]">
      <div className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-bold ${accentClasses}`}>
        {label}
      </div>
      <p className="mt-2 text-sm font-bold text-[#071b46]">{subtitle}</p>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.text} className="flex items-center gap-2.5 text-[13px] font-semibold leading-5 text-[#284768]">
            <InputIcon type={item.type} />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function JointStepCard({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#d6e4f7] bg-white px-4 py-4 shadow-[0_18px_36px_-32px_rgba(12,42,72,0.55)]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a56db] text-[12px] font-bold text-white">
        {number}
      </span>
      <h3 className="mt-4 text-base font-bold leading-6 text-[#071b46]">{title}</h3>
      <p className="mt-2 text-[13px] leading-6 text-[#46617e]">{body}</p>
    </div>
  );
}

function DesktopStreams() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
      viewBox="0 0 1240 620"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="partner-stream-top" x1="154" y1="160" x2="1015" y2="256" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1b66ca" />
          <stop offset="0.5" stopColor="#3d8fe8" />
          <stop offset="1" stopColor="#1460c4" />
        </linearGradient>
        <linearGradient id="partner-stream-bottom" x1="154" y1="452" x2="1015" y2="258" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7ad9f6" />
          <stop offset="0.55" stopColor="#57b5eb" />
          <stop offset="1" stopColor="#1460c4" />
        </linearGradient>
        <filter id="partner-path-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <marker id="partner-arrowhead" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
          <path d="M1 1 11 6 1 11Z" fill="#1664c7" />
        </marker>
      </defs>

      <path
        d="M192 160C294 160 300 269 421 306"
        stroke="#1a56db"
        strokeOpacity="0.13"
        strokeWidth="20"
        strokeLinecap="round"
        filter="url(#partner-path-glow)"
      />
      <path
        d="M192 452C294 452 300 352 421 319"
        stroke="#65c8ef"
        strokeOpacity="0.16"
        strokeWidth="20"
        strokeLinecap="round"
        filter="url(#partner-path-glow)"
      />
      <path
        d="M192 160C294 160 300 269 421 306"
        stroke="url(#partner-stream-top)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M192 452C294 452 300 352 421 319"
        stroke="url(#partner-stream-bottom)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M728 312C858 312 882 244 1032 232"
        stroke="#1a56db"
        strokeOpacity="0.15"
        strokeWidth="28"
        strokeLinecap="round"
        filter="url(#partner-path-glow)"
      />
      <path
        d="M728 312C858 312 882 244 1032 232"
        stroke="url(#partner-stream-top)"
        strokeWidth="10"
        strokeLinecap="round"
        markerEnd="url(#partner-arrowhead)"
      />
      <path
        d="M728 330C854 330 884 270 1004 260"
        stroke="#8fdaf5"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.95"
      />
      <circle cx="421" cy="312" r="10" fill="#ffffff" stroke="#1a56db" strokeWidth="4" />
      <circle cx="728" cy="312" r="10" fill="#ffffff" stroke="#1a56db" strokeWidth="4" />
    </svg>
  );
}

function MobileMerge() {
  return (
    <svg width="76" height="62" viewBox="0 0 76 62" fill="none" aria-hidden>
      <path d="M14 4C14 23 30 33 38 43" stroke="#1a56db" strokeWidth="4" strokeLinecap="round" />
      <path d="M62 4C62 23 46 33 38 43" stroke="#65c8ef" strokeWidth="4" strokeLinecap="round" />
      <path d="M38 43v12" stroke="#1a56db" strokeWidth="4" strokeLinecap="round" />
      <path d="m31 51 7 7 7-7" stroke="#1a56db" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MountainGoal() {
  return (
    <div className="relative mx-auto flex min-h-[330px] w-full max-w-[390px] items-center justify-center lg:min-h-[430px]">
      <div className="absolute inset-y-4 -left-20 right-[-2.25rem] overflow-hidden lg:-left-36 lg:right-[-4.5rem]">
        <Image
          src="/images/nts_partner_progress_destination_bg_v1.png"
          alt=""
          fill
          className="object-cover object-[78%_50%]"
          sizes="(max-width: 1024px) 420px, 560px"
          aria-hidden
        />
      </div>
      <div className="absolute left-1/2 top-[72px] h-44 w-44 -translate-x-1/2 rounded-full bg-white/65 blur-3xl lg:top-[88px] lg:h-56 lg:w-56" />
      <p className="relative z-10 mt-48 text-center text-lg font-bold text-[#071b46] drop-shadow-[0_2px_12px_rgba(255,255,255,0.95)] lg:mt-56 lg:text-xl">
        お客様の前進へ
      </p>
    </div>
  );
}

export default function PartnerHandoffSection() {
  const reduceMotion = useReducedMotion();
  const reveal = (delay: number) => (reduceMotion ? {} : fadeUp(delay));

  return (
    <section
      className="section-alt relative overflow-hidden py-28 md:py-36"
      aria-labelledby="joint-progress-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/75 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-56 h-[520px] w-[1080px] -translate-x-1/2 rounded-full bg-[#dfeeff]/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <motion.div className="mx-auto max-w-4xl text-center" {...reveal(0)}>
          <h2
            id="joint-progress-heading"
            className="font-heading text-3xl font-bold leading-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl"
          >
            御社とともに、
            <br />
            お客様の前進を支える連携へ。
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
            お客様の課題を一緒に深く捉え、提案や事業の前進につながる選択肢をともに考える。
            <br className="hidden md:block" />
            NTSは補助金活用の視点も添えながら、御社の顧客支援と提案活動をバックアップします。
          </p>
        </motion.div>

        <motion.div
          className="relative mt-14 overflow-hidden rounded-[34px] border border-[#d5e4f6] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(238,246,255,0.78))] px-5 py-6 shadow-[0_28px_90px_-58px_rgba(10,49,105,0.48)] md:px-8 md:py-8 lg:mt-20 lg:min-h-[620px] lg:px-10"
          {...reveal(0.08)}
        >
          <DesktopStreams />

          <div className="relative z-10 hidden min-h-[554px] grid-cols-[236px_minmax(400px,1fr)_300px] items-center gap-5 lg:grid xl:grid-cols-[264px_minmax(440px,1fr)_340px] xl:gap-7">
            <div className="space-y-5">
              <SourceCard
                label="御社"
                subtitle="顧客に最も近い提案文脈"
                accent="blue"
                items={partnerInputs}
              />
              <SourceCard
                label="NTS"
                subtitle="制度と実行の支援専門性"
                accent="mint"
                items={ntsInputs}
              />
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-10 rounded-full border border-white/70 bg-white/30" />
              <div className="pointer-events-none absolute -inset-4 rounded-full border border-[#cfe1f8]/70" />

              <div className="relative rounded-[32px] border border-white/90 bg-white/88 px-5 py-6 shadow-[0_26px_70px_-44px_rgba(9,53,114,0.5)] backdrop-blur-sm xl:px-6 xl:py-7">
                <div className="text-center">
                  <p className="text-sm font-bold text-[#1a56db]">御社 × NTS</p>
                  <h3 className="mt-2 font-heading text-2xl font-bold text-[#071b46]">
                    一緒に深く考える
                  </h3>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {jointSteps.map((step) => (
                    <JointStepCard key={step.number} {...step} />
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {supportTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#bfe3da] bg-[#f0fbf7] px-3 py-1.5 text-[12px] font-bold text-[#126c59]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mx-auto mt-5 max-w-lg text-center text-sm font-semibold leading-7 text-[#46617e]">
                  御社の顧客理解とNTSの支援知見を重ね、
                  お客様の前進につながる提案へ。
                </p>
              </div>
            </div>

            <MountainGoal />
          </div>

          <div className="relative z-10 lg:hidden">
            <div className="grid gap-4 sm:grid-cols-2">
              <SourceCard
                label="御社"
                subtitle="顧客に最も近い提案文脈"
                accent="blue"
                items={partnerInputs}
              />
              <SourceCard
                label="NTS"
                subtitle="制度と実行の支援専門性"
                accent="mint"
                items={ntsInputs}
              />
            </div>

            <div className="flex justify-center py-3">
              <MobileMerge />
            </div>

            <div className="rounded-[28px] border border-white/90 bg-white/90 px-4 py-5 shadow-[0_24px_64px_-46px_rgba(9,53,114,0.5)]">
              <div className="text-center">
                <p className="text-sm font-bold text-[#1a56db]">御社 × NTS</p>
                <h3 className="mt-2 font-heading text-2xl font-bold text-[#071b46]">
                  一緒に深く考える
                </h3>
              </div>

              <div className="mt-5 grid gap-3">
                {jointSteps.map((step) => (
                  <JointStepCard key={step.number} {...step} />
                ))}
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {supportTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#bfe3da] bg-[#f0fbf7] px-3 py-1.5 text-[12px] font-bold text-[#126c59]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center pt-5" aria-hidden>
              <div className="h-14 w-1 rounded-full bg-gradient-to-b from-[#1a56db] to-[#65c8ef]" />
              <span className="absolute bottom-0 h-3 w-3 rotate-45 border-b-[3px] border-r-[3px] border-[#1a56db]" />
            </div>

            <MountainGoal />
          </div>
        </motion.div>

        <motion.div
          className="mt-7 flex flex-col gap-5 rounded-[24px] border border-[#d6e4f7] bg-white/95 px-5 py-5 shadow-[0_20px_56px_-42px_rgba(10,49,105,0.48)] md:flex-row md:items-center md:justify-between md:px-7"
          {...reveal(0.16)}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1a56db]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
                <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="16" cy="9" r="3" stroke="currentColor" strokeWidth="1.7" />
                <path
                  d="M3.5 19c.7-2.7 2.4-4.2 4.5-4.2s3.8 1.5 4.5 4.2M11.5 19c.7-2.7 2.4-4.2 4.5-4.2s3.8 1.5 4.5 4.2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <p className="text-lg font-bold text-[#1a56db]">まずは案件のご相談から</p>
              <p className="mt-1 text-sm leading-6 text-[#46617e]">
                提案中の案件や、今後のご計画についてお気軽にご相談ください。
              </p>
            </div>
          </div>

          <a
            href="#contact"
            className="inline-flex min-h-12 items-center justify-center rounded-[14px] bg-[#0f3e8d] px-7 text-base font-bold text-white shadow-[0_16px_34px_-20px_rgba(15,62,141,0.8)] transition hover:bg-[#0c3477] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a56db] focus-visible:ring-offset-2"
          >
            案件のご相談はこちら
          </a>
        </motion.div>
      </div>
    </section>
  );
}
