"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="flex min-h-screen items-center justify-center bg-[#F3F6FA] px-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">NTS Admin</p>
          <h1 className="mt-1 text-2xl font-black text-[#0B173A]">管理者ログイン</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200 bg-white px-8 py-8 shadow-sm"
        >
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold text-gray-600">
              ユーザー名
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#0B173A] focus:ring-2 focus:ring-[#0B173A]/10"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-xs font-bold text-gray-600">
              パスワード
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#0B173A] focus:ring-2 focus:ring-[#0B173A]/10"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0B173A] py-2.5 text-sm font-bold text-white transition hover:opacity-80 disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </main>
  );
}
