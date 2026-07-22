"use client";

import * as React from "react";

export interface LoginScreenProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export function LoginScreen({onSubmit, isLoading = false}: LoginScreenProps): React.JSX.Element {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);

    try {
      await onSubmit(email, password);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Login failed.");
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-10 text-[#f2f2f2] md:py-16">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-[#101010] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.42)] md:p-8">
        <div className="space-y-2 border-b border-white/10 pb-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#868686]">Alicutz</p>
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">Admin Login</h1>
          <p className="text-sm text-[#9f9f9f]">Secure access for internal management only.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <label htmlFor="admin-email" className="text-xs font-medium uppercase tracking-[0.14em] text-[#8d8d8d]">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-11 w-full rounded-xl border border-white/15 bg-[#151515] px-3 text-sm text-[#f1f1f1] outline-none transition-colors focus:border-white/35"
              placeholder="admin@alicutz.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="admin-password"
              className="text-xs font-medium uppercase tracking-[0.14em] text-[#8d8d8d]"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-11 w-full rounded-xl border border-white/15 bg-[#151515] px-3 text-sm text-[#f1f1f1] outline-none transition-colors focus:border-white/35"
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-xl border border-white/20 bg-[#1a1a1a] text-sm font-medium text-[#f5f5f5] transition-colors hover:bg-[#202020] disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        <button type="button" className="mt-4 text-sm text-[#909090] underline-offset-4 hover:underline">
          Forgot password
        </button>
      </div>
    </main>
  );
}
