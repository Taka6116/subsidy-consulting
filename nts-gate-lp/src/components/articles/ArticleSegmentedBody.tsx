import { Fragment } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  splitArticleBodyByH2,
  detectSectionVisualKind,
} from "@/lib/articles/splitArticleBodyByH2";
import {
  ApplicationSteps,
  SubsidySpecCard,
  UseCaseDiagram,
  type ArticleVisualData,
} from "@/components/articles/ArticleVisualBlocks";

/**
 * H2（## 1. 〜）単位に分割し、該当見出し直後に図解を明示配置する。
 * Markdown AST 上の h2 差し替えに依存しない。
 */
export function ArticleSegmentedBody({
  body,
  visualData,
}: {
  body: string;
  visualData: ArticleVisualData;
}) {
  const sections = splitArticleBodyByH2(body);

  if (sections.length === 0) {
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>;
  }

  return (
    <>
      {sections.map((sec, idx) => {
        if (sec.order === 0 && !sec.headingLine) {
          return (
            <ReactMarkdown key={`pre-${idx}`} remarkPlugins={[remarkGfm]}>
              {sec.body}
            </ReactMarkdown>
          );
        }

        const kind = detectSectionVisualKind(sec.headingLine, sec.order);
        // 見出し・本文から「架空の事例」表記を除去して表示
        const cleanHeading = sec.headingLine
          .replace(/【架空の事例】/g, "")
          .replace(/\[架空の事例\]/g, "")
          .replace(/【活用例】/g, "")
          .replace(/\[活用例\]/g, "")
          .trim();
        const headingMd = `${cleanHeading}\n`;

        return (
          <Fragment key={`sec-${sec.order}-${idx}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{headingMd}</ReactMarkdown>
            {kind === "useCase" ? (
              <div className="not-prose">
                <UseCaseDiagram
                  data={visualData}
                  section2Markdown={sec.body}
                  bodyMarkdown={body}
                />
              </div>
            ) : null}
            {kind === "subsidySpec" ? (
              <div className="not-prose">
                <SubsidySpecCard data={visualData} />
              </div>
            ) : null}
            {kind === "application" ? (
              <div className="not-prose">
                <ApplicationSteps />
              </div>
            ) : null}
            {sec.body.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{sec.body}</ReactMarkdown>
            ) : null}
          </Fragment>
        );
      })}
    </>
  );
}
