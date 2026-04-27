const DEFAULT_ASSET_BASE_URL = "/icon-assets/subsidy-lp";

export function subsidyLpAsset(filename: string): string {
  const base = process.env.NEXT_PUBLIC_LP_ASSET_BASE_URL?.replace(/\/$/, "");
  return `${base || DEFAULT_ASSET_BASE_URL}/${filename}`;
}

