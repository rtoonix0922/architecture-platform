"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("admin@demo.com");
  const [pw, setPw] = useState("admin123"); // placeholder for now

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, tenant_id: "t1" }),
    });
    if (!r.ok) return alert("Login failed");
    const { token } = await r.json();
    localStorage.setItem("token", token);
    location.href = "/dashboard";
  }

  return (
    <main className="min-h-dvh grid place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 p-6 border rounded-2xl">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <input className="border p-2 w-full rounded" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full rounded" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
        <button className="px-4 py-2 rounded-2xl shadow w-full bg-black text-white">Continue</button>
      </form>
    </main>
  );
}
