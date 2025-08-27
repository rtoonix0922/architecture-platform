"use client";
import { useEffect, useState } from "react";

type Project = { id: number; title: string; status: string; budget: number };

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { location.href = "/login"; return; }
    (async () => {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { setLoading(false); return; }
      setProjects(await r.json());
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tenant Dashboard</h1>
      <section className="grid gap-3">
        {projects.map(p => (
          <article key={p.id} className="border rounded-2xl p-4">
            <div className="font-semibold">{p.title}</div>
            <div>Status: {p.status}</div>
            <div>Budget: {p.budget}</div>
          </article>
        ))}
        {projects.length === 0 && <div className="text-sm text-neutral-500">No projects yet.</div>}
      </section>
    </main>
  );
}
