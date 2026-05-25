import {
  Children,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

export type RevealToken = {
  char: string;
  wrapper?: { className?: string; style?: CSSProperties };
};

/** children 内の <br /> で行分割し、各行を文字トークンに展開 */
export function parseRevealLines(children: ReactNode): RevealToken[][] {
  const lines: RevealToken[][] = [[]];

  const pushChar = (char: string, wrapper?: RevealToken["wrapper"]) => {
    lines[lines.length - 1].push({ char, wrapper });
  };

  const pushLine = () => {
    lines.push([]);
  };

  const walk = (node: ReactNode, wrapper?: RevealToken["wrapper"]) => {
    Children.forEach(node, (child) => {
      if (typeof child === "string" || typeof child === "number") {
        Array.from(String(child)).forEach((char) => pushChar(char, wrapper));
        return;
      }
      if (!isValidElement(child)) return;

      const el = child as ReactElement<{
        children?: ReactNode;
        className?: string;
        style?: CSSProperties;
      }>;

      if (el.type === "br") {
        pushLine();
        return;
      }

      const nextWrapper =
        el.type === "span"
          ? { className: el.props.className, style: el.props.style }
          : wrapper;

      if (el.props.children != null) {
        walk(el.props.children, nextWrapper);
      }
    });
  };

  walk(children);

  return lines.filter((line) => line.length > 0);
}

export function flattenRevealLines(lines: RevealToken[][]): RevealToken[] {
  return lines.flat();
}
