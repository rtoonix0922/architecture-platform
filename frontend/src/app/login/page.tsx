"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/Card";

export default function LoginPage() {
  const API = process.env.NEXT_PUBLIC_API;
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // if already logged in, go straight to dashboard
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) location.href = "/dashboard";
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, tenant_id: "t1" }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        setErr(body?.error || `Login failed: HTTP ${r.status}`);
      } else {
        const { token } = await r.json();
        localStorage.setItem("token", token);
        location.href = "/dashboard";
      }
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl ring-1 ring-slate-200">
      <CardBody>
        <form onSubmit={onSubmit} className="grid gap-3">
          <h1 className="text-xl font-semibold">Sign in</h1>

          <input
            type="email"
            className="border p-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="border p-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button
            disabled={loading}
            className="h-10 rounded-lg bg-slate-900 text-white shadow hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Continue"}
          </button>

          <div className="text-[11px] text-slate-500">
            API: {API}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
