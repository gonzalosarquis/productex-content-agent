"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md border border-[#2a2a2a] bg-[#1a1a1a] p-10">
        <h1
          className="mb-2 text-center text-4xl tracking-wide text-[#f5f2ec]"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          Productex Content Agent
        </h1>
        <p className="mb-8 text-center text-sm text-[#f5f2ec]/60">
          Acceso interno — equipo Productex
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-[#f5f2ec]/50">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-[#f5f2ec] outline-none focus:border-[#c8ff00]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-[#f5f2ec]/50">
              Contraseña
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-[#f5f2ec] outline-none focus:border-[#c8ff00]"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-lg tracking-wide text-black transition hover:opacity-90 disabled:opacity-50"
            style={{
              fontFamily: "var(--font-bebas), sans-serif",
              backgroundColor: "#c8ff00",
            }}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
