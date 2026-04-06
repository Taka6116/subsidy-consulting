"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { trackDiagnosisStep, trackDiagnosisResult } from "@/lib/analytics";
import DiagnosisStepArt from "@/components/diagnosis/DiagnosisStepArt";
import {
  DIAGNOSIS_STORAGE_KEY,
  DIAGNOSIS_TOTAL_STEPS,
  type DiagnosisAnswers,
  type DiagnosisQuestion,
  getQuestionForStep,
  resolveResultPath,
} from "@/lib/diagnosis-logic";

function pickAnswer(
  prev: Partial<DiagnosisAnswers>,
  key: keyof DiagnosisAnswers,
  value: DiagnosisAnswers[typeof key],
): Partial<DiagnosisAnswers> {
  const next = { ...prev, [key]: value };
  if (key === "q1") {
    delete next.q4;
  }
  return next;
}

function StepDots({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: total }, (_, i) => {
        const active = i <= current;
        return (
          <div key={i} className="flex items-center gap-3">
            <span
              className={`block h-3 w-3 rounded-full transition-colors duration-300 ${
                active ? "bg-accent-500" : "bg-neutral-200"
              }`}
            />
            {i < total - 1 && (
              <span
                className={`block h-[2px] w-8 transition-colors duration-300 sm:w-12 ${
                  i < current ? "bg-accent-500" : "bg-neutral-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DiagnosisWizard() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<DiagnosisAnswers>>({});

  const question = useMemo(
    () => getQuestionForStep(step, answers),
    [step, answers],
  );

  const currentKey = question?.id;
  const currentValue = currentKey ? answers[currentKey] : undefined;

  const setSelection = useCallback(
    (q: DiagnosisQuestion, value: string) => {
      setAnswers((prev) => pickAnswer(prev, q.id, value as DiagnosisAnswers[typeof q.id]));
    },
    [],
  );

  const canGoNext = Boolean(currentValue);
  const isLast = step === DIAGNOSIS_TOTAL_STEPS - 1;

  const goNext = () => {
    if (!canGoNext || !question) return;
    trackDiagnosisStep(step + 1, "complete");
    if (isLast) {
      const merged: Partial<DiagnosisAnswers> = {
        ...answers,
        ...(currentKey && currentValue
          ? { [currentKey]: currentValue }
          : {}),
      };
      const full = merged as DiagnosisAnswers;
      if (!full.q1 || !full.q2 || !full.q3 || !full.q4) return;
      try {
        sessionStorage.setItem(
          DIAGNOSIS_STORAGE_KEY,
          JSON.stringify({
            ...full,
            savedAt: new Date().toISOString(),
          }),
        );
      } catch {
        /* ignore quota / private mode */
      }
      trackDiagnosisResult(full.q1);
      router.push(resolveResultPath(full.q1));
      return;
    }
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step <= 0) return;
    setStep((s) => s - 1);
  };

  if (!question) return null;

  const fadeVariants = {
    initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 },
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[720px] flex-col px-4 pb-12 pt-6 sm:px-6 md:px-8">
      {/* --- Mini header --- */}
      <header className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="font-heading text-[15px] font-bold tracking-tight text-primary-900 hover:text-primary-700"
        >
          NTS 日本提携支援
        </Link>
        <Link
          href="/"
          className="text-caption text-primary-700 hover:text-primary-500"
        >
          ← トップに戻る
        </Link>
      </header>

      {/* --- Step indicator --- */}
      <div className="mb-3 text-center">
        <span className="font-display text-[13px] font-semibold tracking-[0.12em] text-accent-500">
          Question {String(step + 1).padStart(2, "0")}
        </span>
        <span className="mx-2 text-[13px] text-neutral-500">/</span>
        <span className="text-[13px] text-neutral-500">
          {String(DIAGNOSIS_TOTAL_STEPS).padStart(2, "0")}
        </span>
      </div>
      <div className="mb-8">
        <StepDots current={step} total={DIAGNOSIS_TOTAL_STEPS} />
      </div>

      {/* --- Question card --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id + step}
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-1 flex-col items-center rounded-2xl border border-neutral-200/80 bg-white px-5 py-10 shadow-sm sm:px-10 sm:py-12"
        >
          <DiagnosisStepArt stepId={question.id} />

          <h2 className="mb-2 text-center font-heading text-h2 font-bold leading-tight text-primary-900">
            {question.title}
          </h2>
          <p className="mb-10 text-center text-small text-neutral-500">
            {question.hint}
          </p>

          {/* --- Circular option buttons --- */}
          <fieldset className="flex w-full flex-wrap items-start justify-center gap-4 border-0 p-0 sm:gap-6">
            <legend className="sr-only">{question.title}</legend>
            {question.options.map((opt) => {
              const selected = currentValue === opt.value;
              return (
                <label
                  key={opt.value}
                  className="group flex w-[130px] cursor-pointer flex-col items-center gap-3 sm:w-[140px]"
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name={question.id}
                    value={opt.value}
                    checked={selected}
                    onChange={() => setSelection(question, opt.value)}
                  />
                  <span
                    className={`flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 transition-all duration-200 sm:h-[80px] sm:w-[80px] ${
                      selected
                        ? "border-accent-500 bg-accent-500/10 shadow-md shadow-accent-500/15"
                        : "border-neutral-200 bg-neutral-50 group-hover:border-primary-300 group-hover:bg-primary-50"
                    }`}
                  >
                    <span
                      className={`block h-3 w-3 rounded-full transition-all duration-200 ${
                        selected
                          ? "scale-100 bg-accent-500"
                          : "scale-0 bg-transparent"
                      }`}
                    />
                  </span>
                  <span
                    className={`text-center text-[13px] font-medium leading-snug transition-colors ${
                      selected ? "text-primary-900" : "text-neutral-600"
                    }`}
                  >
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </fieldset>
        </motion.div>
      </AnimatePresence>

      {/* --- Navigation buttons --- */}
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="rounded-card border-2 border-neutral-200 bg-white px-6 py-3 text-small font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="rounded-card bg-accent-500 px-8 py-3 text-body font-medium text-white shadow-sm transition-all hover:bg-accent-600 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLast ? "結果を見る" : "次へ"}
        </button>
      </div>

      {/* --- Footer note --- */}
      <p className="mt-6 text-center text-caption text-neutral-500">
        個人情報の入力は不要です
      </p>
    </div>
  );
}
