"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    const response =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
          });

    if (response.error) {
      setMessage(response.error.message);
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      setMessage("Account created. Confirm email if required, then sign in.");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">n.e. thing training CRM</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to access operations, messaging, and readiness workflows.</p>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full"
          />
          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Working..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <button
          className="mt-3 text-sm text-brand-700"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>

        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      </div>
    </main>
  );
}
