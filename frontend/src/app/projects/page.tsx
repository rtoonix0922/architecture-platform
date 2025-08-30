"use client";
import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";

type Project = { id:number; title:string; status:string; budget:number; region?:string|null; province?:string|null; progress_pct?:number };

export default function ProjectsList() {
  const API = process.env.NEXT_PUBLIC_API;
  const [items, setItems] = useState<Project[]>([]);

  useEffect(() => {
    const tok = localStorage.getItem("token");
    if (!tok) { location.href="/login"; return; }
    (async () => {
      const r = await fetch(`${API}/projects`, { headers:{ Authorization:`Bearer ${tok}` }});
      setItems(r.ok ? await r.json() : []);
    })();
  }, [API]);

  const fmt = (n:number)=> new Intl.NumberFormat().format(n);

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(p=>(
          <Card key={p.id} className="hover:shadow-card-lg transition">
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>
                    <a className="hover:underline" href={`/projects/${p.id}`}>{p.title}</a>
                  </CardTitle>
                  <div className="text-sm text-slate-600 mt-1">
                    Budget: {fmt(p.budget)}{p.region ? ` • ${p.region}${p.province?`, ${p.province}`:''}` : ""}
                  </div>
                  <div className="mt-2"><StatusBadge status={p.status} /></div>
                </div>
                <a className="text-sm underline" href={`/projects/${p.id}`}>Open</a>
              </div>
            </CardBody>
          </Card>
        ))}
        {items.length===0 && (
          <Card><CardBody><div className="text-sm text-slate-500">No projects yet.</div></CardBody></Card>
        )}
      </div>
    </main>
  );
}
