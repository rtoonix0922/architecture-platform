"use client";
import { useEffect, useState } from "react";

type Project = { id: number; title: string; status: string; budget: number };

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const API = process.env.NEXT_PUBLIC_API;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { location.href = "/login"; return; }

    (async () => {
      try {
        const r = await fetch(`${API}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setProjects(await r.json());
      } catch (e: any) {
        setError(e.message || "Failed to load projects");
      }
    })();
  }, [API]);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tenant Dashboard</h1>
      {error && <div className="bg-red-100 border text-red-800 p-3 rounded-2xl">
        Dashboard error: {error}
      </div>}
      <section className="grid gap-3">
        {projects.map(p => (
          <article key={p.id} className="border rounded-2xl p-4">
            <div className="font-semibold">{p.title}</div>
            <div>Status: {p.status}</div>
            <div>Budget: {p.budget}</div>
          </article>
        ))}
        {projects.length === 0 && !error && (
          <div className="text-sm text-neutral-500">No projects yet.</div>
        )}
      </section>
    </main>
  );
}
