"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, CardTitle } from "@/components/Card";

type Project = {
  id:number; title:string; status:string; budget:number;
  region?:string|null; province?:string|null;
  abc_amount?:number|null; contract_amount?:number|null;
  proc_status?:string|null; progress_pct?:number|null;
};
type Event = {
  id:number; project_id:number; type:string; stage:string|null;
  title:string|null; notes:string|null; url:string|null;
  amount:number|null; happened_at:string;
};

const STAGES = ["plan","preproc","post","prebid","open","eval","postqual","award","noa","contract","ntp","ongoing","complete","closed"];

export default function ProjectDetail() {
  const params = useParams<{ id: string | string[] }>();
  const idStr = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const id = Number(idStr);

  const API = process.env.NEXT_PUBLIC_API;
  const [p, setP] = useState<Project | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [err, setErr] = useState<string|null>(null);

  const [form, setForm] = useState({
    type: "procurement_milestone",
    stage: "",
    title: "",
    notes: "",
    url: "",
    amount: "",
    happened_at: "",
  });

  const token = () => localStorage.getItem("token");
  const fmtDate = (iso:string)=> { try { return new Date(iso).toLocaleString(); } catch { return iso; } };
  const fmt = (n:number)=> new Intl.NumberFormat().format(n);

  useEffect(() => {
    if (!id || Number.isNaN(id)) return; // wait for params
    const tok = token();
    if (!tok) {
      location.href = "/login"; // perform redirect then exit (do not return the value)
      return;
    }

    (async () => {
      try {
        const [pr, er] = await Promise.all([
          fetch(`${API}/projects/${id}`, { headers:{ Authorization:`Bearer ${tok}` }}),
          fetch(`${API}/procurement/events?project_id=${id}`, { headers:{ Authorization:`Bearer ${tok}` }})
        ]);
        if (!pr.ok) throw new Error(`Project HTTP ${pr.status}`);
        if (!er.ok) throw new Error(`Events HTTP ${er.status}`);
        setP(await pr.json());
        setEvents(await er.json());
        setErr(null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setErr(msg || "Failed to load");
      }
    })();
  }, [API, id]);

  async function addEvent(e:React.FormEvent) {
    e.preventDefault();
    if (!id || Number.isNaN(id)) return;
    const tok = token();
    if (!tok) {
      location.href = "/login";
      return;
    }

    const body = {
      project_id: id,
      type: form.type,
      stage: form.stage || null,
      title: form.title || null,
      notes: form.notes || null,
      url: form.url || null,
      amount: form.amount ? Number(form.amount) : null,
      happened_at: form.happened_at || null,
    };

    const r = await fetch(`${API}/procurement/events`, {
      method: "POST",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${tok}` },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      alert(`Add event failed: HTTP ${r.status}`);
      return;
    }
    const ev: Event = await r.json();
    setEvents(prev => [ev, ...prev]);
    setForm({ type:"procurement_milestone", stage:"", title:"", notes:"", url:"", amount:"", happened_at:"" });
  }

  return (
    <div className="space-y-6">
      <a className="text-sm underline" href="/projects">← Back to Projects</a>

      {err && (
        <Card><CardBody><div className="text-red-700">Error: {err}</div></CardBody></Card>
      )}

      {p && (
        <Card className="shadow-md">
          <CardBody>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{p.title}</CardTitle>
                <div className="text-sm text-slate-600 mt-1">
                  Status: {p.status} • Procurement: {p.proc_status ?? "—"} • Progress: {p.progress_pct ?? 0}%
                </div>
                <div className="text-sm text-slate-600">
                  Budget: {fmt(p.budget)}{p.region ? ` • ${p.region}${p.province?`, ${p.province}`:''}` : ''}
                </div>
              </div>
              <div className="text-right text-sm text-slate-600">
                {p.abc_amount!=null && <div>ABC: ₱{fmt(p.abc_amount)}</div>}
                {p.contract_amount!=null && <div>Contract: ₱{fmt(p.contract_amount)}</div>}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Add Event */}
      <Card className="shadow-md">
        <CardBody>
          <CardTitle className="mb-3">Add Event</CardTitle>
          <form onSubmit={addEvent} className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-xs text-slate-600">Type</label>
              <select className="border p-2 rounded-lg" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                <option value="procurement_milestone">procurement_milestone</option>
                <option value="stage_changed">stage_changed</option>
                <option value="doc_uploaded">doc_uploaded</option>
                <option value="progress_update">progress_update</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-slate-600">Stage (optional)</label>
              <select className="border p-2 rounded-lg" value={form.stage} onChange={e=>setForm({...form, stage:e.target.value})}>
                <option value="">—</option>
                {STAGES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs text-slate-600">Title</label>
              <input className="border p-2 rounded-lg" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs text-slate-600">Notes</label>
              <textarea className="border p-2 rounded-lg" rows={3} value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})}/>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-slate-600">Document URL (optional)</label>
              <input className="border p-2 rounded-lg" value={form.url} onChange={e=>setForm({...form, url:e.target.value})}/>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-slate-600">Amount (optional)</label>
              <input type="number" className="border p-2 rounded-lg" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})}/>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-slate-600">Date (optional)</label>
              <input type="datetime-local" className="border p-2 rounded-lg" value={form.happened_at} onChange={e=>setForm({...form, happened_at:e.target.value})}/>
            </div>
            <div className="md:col-span-2">
              <button className="px-4 py-2 rounded-lg bg-slate-900 text-white shadow hover:opacity-90">Add Event</button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Timeline */}
      <Card className="shadow-md">
        <CardBody>
          <CardTitle className="mb-3">Timeline</CardTitle>
          <ul className="space-y-3">
            {events.map(ev=>(
              <li key={ev.id} className="rounded-xl p-3 bg-white ring-1 ring-slate-200 shadow-sm">
                <div className="text-sm text-slate-500">{fmtDate(ev.happened_at)}</div>
                <div className="font-medium">{ev.title || ev.type}</div>
                {ev.stage && <div className="text-xs text-slate-600">Stage: {ev.stage}</div>}
                {ev.notes && <div className="text-sm mt-1 whitespace-pre-wrap">{ev.notes}</div>}
                {ev.url && <a className="text-sm underline" href={ev.url} target="_blank">Open document</a>}
              </li>
            ))}
            {events.length===0 && <div className="text-sm text-slate-500">No events yet.</div>}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
