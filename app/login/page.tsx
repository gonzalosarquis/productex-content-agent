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
      <div className="w-full max-w-md rounded-2xl border border-neutral-200/90 bg-white p-10 shadow-sm sm:p-12">
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-neutral-900">
          Productex Content Agent
        </h1>
        <p className="mb-10 text-center text-sm text-neutral-500">
          Acceso interno — equipo Productex
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-neutral-700">
              Contraseña
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/15"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
