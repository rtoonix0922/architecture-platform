"use client";
import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type KPIs = { projects:number; allocated:number; awarded:number };
type Stage = { stage:string; cnt:number };

export default function Portfolio() {
  const API = process.env.NEXT_PUBLIC_API;
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    const t = localStorage.getItem("token"); if (!t) { location.href="/login"; return; }
    fetch(`${API}/portfolio/overview`, { headers:{ Authorization:`Bearer ${t}` }})
      .then(r => r.json())
      .then(({kpis, by_stage}) => { setKpis(kpis); setStages(by_stage || []); });
  }, [API]);

  const fmt = (n:number)=> new Intl.NumberFormat().format(n);

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Portfolio Overview</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi label="Total Projects" value={kpis ? String(kpis.projects) : "—"} />
        <Kpi label="Allocated (Budget)" value={kpis ? `₱${fmt(kpis.allocated)}` : "—"} />
        <Kpi label="Awarded (Contracts)" value={kpis ? `₱${fmt(kpis.awarded||0)}` : "—"} />
      </div>

      <Card className="shadow-card">
        <CardBody>
          <CardTitle className="mb-3">Projects by Stage</CardTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stages}>
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="cnt" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}

function Kpi({ label, value }:{label:string; value:string}) {
  return (
    <Card className="shadow-card">
      <CardBody>
        <CardTitle>{label}</CardTitle>
        <div className="text-4xl font-bold mt-1">{value}</div>
      </CardBody>
    </Card>
  );
}
