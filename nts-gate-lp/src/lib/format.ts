/**
 * 金額を日本語表記でフォーマットする。
 *
 * @example formatYen(200_000_000) => "2億円"
 * @example formatYen(150_000_000, { style: "hero" }) => "1.5 億円"
 */
export function formatYen(
  amount: number | bigint | null | undefined,
  options?: { style?: "default" | "hero" },
): string {
  if (amount == null) return "応相談";

  const value = typeof amount === "bigint" ? Number(amount) : amount;
  if (!Number.isFinite(value) || value <= 0) return "応相談";

  if (value >= 100_000_000) {
    const oku = value / 100_000_000;
    const label = oku % 1 === 0 ? String(oku) : oku.toFixed(1);
    return options?.style === "hero" ? `${label} 億円` : `${label}億円`;
  }

  if (value >= 10_000) {
    const man = Math.floor(value / 10_000);
    return `${man.toLocaleString("ja-JP")}万円`;
  }

  return `${value.toLocaleString("ja-JP")}円`;
}
