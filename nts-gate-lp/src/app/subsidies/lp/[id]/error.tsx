"use client";

export default function SubsidyLpError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div style={{ padding: "2rem", fontFamily: "monospace", background: "#fff", color: "#c00" }}>
      <h1>LP Page Error (debug)</h1>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
        {error?.message ?? "unknown error"}
        {"\n\n"}
        {error?.stack ?? "no stack"}
        {"\n\ndigest: "}
        {error?.digest ?? "none"}
      </pre>
    </div>
  );
}
