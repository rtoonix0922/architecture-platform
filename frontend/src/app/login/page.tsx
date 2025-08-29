"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123"); // <- add this
  const [loading, setLoading] = useState(false);
  const API = process.env.NEXT_PUBLIC_API;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, tenant_id: "t1" }), // <- include password
      });
      if (!r.ok) throw new Error(`Login failed (${r.status})`);
      const { token } = await r.json();
      localStorage.setItem("token", token);
      location.href = "/dashboard";
    } catch (err: any) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 p-6 border rounded-2xl">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <input
          className="border p-2 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@demo.com"
          autoComplete="username"
        />
        <input
          className="border p-2 w-full rounded"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <button className="px-4 py-2 rounded-2xl shadow w-full bg-black text-white" disabled={loading}>
          {loading ? "Signing in..." : "Continue"}
        </button>
        <p className="text-xs text-neutral-500">API: {API}</p>
      </form>
    </main>
  );
}
