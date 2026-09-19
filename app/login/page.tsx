"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const demoAccounts = [
  { label: "Admin", email: "admin@motevra.com", password: "Admin123!" },
  { label: "Customer", email: "driver@motevra.com", password: "Driver123!" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("driver@motevra.com");
  const [password, setPassword] = useState("Driver123!");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f97316] text-lg font-black text-slate-950">
            M
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.06em] text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to continue with MOTEVRA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#f97316]"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#f97316]"
              placeholder="••••••••"
              required
            />
          </div>

          {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#f97316] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-8 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Demo accounts</div>
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-[#f97316]/50"
            >
              <span>{account.label}</span>
              <span className="font-medium text-slate-900">{account.email}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-slate-600">
          Looking for a store? <Link href="/" className="font-semibold text-slate-900 underline">Back to shop</Link>
        </div>
      </div>
    </div>
  );
}
