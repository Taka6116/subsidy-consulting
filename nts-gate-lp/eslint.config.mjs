import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
// Node ESM ではサブパス解決に明示的な .js が必要な場合がある
import coreWebVitals from "eslint-config-next/core-web-vitals.js";
import typescript from "eslint-config-next/typescript.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // ========== [NEW 2026-04-30] lint対象外 - 生成物と設定ファイル ==========
  // `.next` はNext.jsの生成物、tailwind.config.js は既存CJS設定のためESLint対象外にする。
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "lambda/**/node_modules/**",
      "tailwind.config.js",
    ],
  },
  ...compat.config(coreWebVitals),
  ...compat.config(typescript),
];
