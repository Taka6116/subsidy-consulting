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

  const inputBase: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "14px",
    color: "#fff",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0d4b8a 0%, #1160b0 25%, #1a6ec4 50%, #1480d4 70%, #0f9ed0 90%, #12b5e0 100%)",
        padding: "16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 背景の光の装飾 */}
      <div style={{
        position: "absolute", top: "-10%", right: "-5%",
        width: "420px", height: "420px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(100,200,255,0.18) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", left: "-10%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(20,100,200,0.25) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* カード */}
      <div style={{
        width: "100%",
        maxWidth: "340px",
        background: "rgba(255,255,255,0.13)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
        padding: "36px 32px 32px",
      }}>
        {/* ヘッダー */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <p style={{
            fontSize: "22px",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.05em",
            margin: 0,
            lineHeight: 1.2,
          }}>NTS Admin</p>
          <p style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.55)",
            marginTop: "4px",
            letterSpacing: "0.06em",
          }}>問い合わせ管理ダッシュボード</p>
          <p style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.65)",
            marginTop: "12px",
          }}>ユーザー名とパスワードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ユーザー名 */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              marginBottom: "6px",
            }}>ユーザー名</label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="admin"
              style={inputBase}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(100,210,255,0.7)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(100,210,255,0.15)";
                e.currentTarget.style.background = "rgba(255,255,255,0.17)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.22)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              }}
            />
          </div>

          {/* パスワード */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              marginBottom: "6px",
            }}>パスワード</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ ...inputBase, paddingRight: "44px" }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(100,210,255,0.7)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(100,210,255,0.15)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.17)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.22)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.5)",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={showPass ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* エラー */}
          {error && (
            <div style={{
              marginBottom: "14px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(239,68,68,0.18)",
              border: "1px solid rgba(239,68,68,0.35)",
              color: "#fca5a5",
              fontSize: "12px",
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          {/* ログインボタン */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(90deg, #1a7fd4 0%, #2196f3 50%, #29b6f6 100%)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              boxShadow: "0 4px 16px rgba(33,150,243,0.45)",
              transition: "filter 0.2s, transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                const b = e.currentTarget;
                b.style.filter = "brightness(1.08)";
                b.style.transform = "translateY(-1px)";
                b.style.boxShadow = "0 8px 24px rgba(33,150,243,0.55)";
              }
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget;
              b.style.filter = "";
              b.style.transform = "";
              b.style.boxShadow = "0 4px 16px rgba(33,150,243,0.45)";
            }}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </main>
  );
}
