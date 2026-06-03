"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/admin/contacts");
      } else {
        setError("ユーザー名またはパスワードが正しくありません。");
      }
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{
        background: "linear-gradient(135deg, #0f2027 0%, #162840 30%, #1a3a52 55%, #0d4a6b 75%, #005f8a 90%, #0077a8 100%)",
      }}
    >
      {/* 装飾ブロブ */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #00c6ff 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(ellipse, #38bdf8 0%, transparent 70%)" }}
      />

      {/* グラスカード */}
      <div
        className="relative w-full max-w-sm rounded-3xl p-px"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)",
        }}
      >
        <div
          className="rounded-3xl px-8 py-10"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* ロゴ */}
          <div className="mb-8 text-center">
            <span
              className="inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]"
              style={{
                background: "rgba(0,198,255,0.15)",
                color: "#7ee8ff",
                border: "1px solid rgba(0,198,255,0.3)",
              }}
            >
              NTS Admin
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white">
              管理者ログイン
            </h1>
            <p className="mt-1 text-xs text-white/40">問い合わせ管理ダッシュボード</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ユーザー名 */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/60">
                ユーザー名
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(0,198,255,0.6)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,198,255,0.12)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.11)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.15)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
              />
            </div>

            {/* パスワード */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/60">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/25 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(0,198,255,0.6)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,198,255,0.12)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.11)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.15)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }}
                />
                {/* 目のアイコン */}
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 transition-colors hover:text-white/80"
                  tabIndex={-1}
                  aria-label={showPass ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPass ? (
                    /* 目を閉じるアイコン */
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"18px",height:"18px"}}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    /* 目のアイコン */
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"18px",height:"18px"}}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* エラー */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-xs font-medium text-red-200"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}
              >
                {error}
              </div>
            )}

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-black tracking-wide text-white transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #0b4ea2 0%, #0e6ec0 45%, #00b4d8 100%)",
                boxShadow: "0 8px 24px rgba(0,180,216,0.35), 0 2px 8px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 32px rgba(0,180,216,0.45), 0 4px 12px rgba(0,0,0,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.filter = "";
                (e.currentTarget as HTMLButtonElement).style.transform = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(0,180,216,0.35), 0 2px 8px rgba(0,0,0,0.3)";
              }}
            >
              <span className="relative z-10">
                {loading ? "ログイン中..." : "ログイン"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
