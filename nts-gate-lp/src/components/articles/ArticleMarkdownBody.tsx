"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

import {
  ApplicationSteps,
  SubsidySpecCard,
  UseCaseDiagram,
  type ArticleVisualData,
} from "@/components/articles/ArticleVisualBlocks";

function flattenHeadingText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenHeadingText).join("");
  if (typeof node === "object" && "props" in node) {
    const el = node as { props?: { children?: ReactNode } };
    return flattenHeadingText(el.props?.children ?? "");
  }
  return "";
}

export function ArticleMarkdownBody({
  body,
  visualData,
}: {
  body: string;
  visualData: ArticleVisualData;
}) {
  const components: Components = {
    h2: ({ children, ...props }) => {
      const text = flattenHeadingText(children);
      const showUseCase =
        text.includes("活用できる企業") && text.includes("活用例");
      const showSubsidySpec =
        text.includes("補助額") &&
        text.includes("補助率") &&
        text.includes("申請期限");
      const showApplication = text.includes("申請の流れ");

      return (
        <>
          <h2 {...props}>{children}</h2>
          {showUseCase ? (
            <div className="not-prose">
              <UseCaseDiagram data={visualData} bodyMarkdown={body} />
            </div>
          ) : null}
          {showSubsidySpec ? (
            <div className="not-prose">
              <SubsidySpecCard data={visualData} />
            </div>
          ) : null}
          {showApplication ? (
            <div className="not-prose">
              <ApplicationSteps />
            </div>
          ) : null}
        </>
      );
    },
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {body}
    </ReactMarkdown>
  );
}
