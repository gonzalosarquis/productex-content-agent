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
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-24">
      <div className="w-full max-w-md border border-neutral-200 bg-white p-12 shadow-sm">
        <h1
          className="mb-2 text-center text-4xl tracking-wide text-neutral-900"
          style={{ fontFamily: "var(--font-bebas), sans-serif" }}
        >
          Productex Content Agent
        </h1>
        <p className="mb-10 text-center text-sm text-neutral-500">
          Acceso interno — equipo Productex
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-500">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-neutral-900 outline-none transition focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-500">
              Contraseña
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-neutral-900 outline-none transition focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7C3AED] py-3 text-lg tracking-wide text-white transition hover:bg-[#6d28d9] disabled:opacity-50"
            style={{
              fontFamily: "var(--font-bebas), sans-serif",
            }}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
