"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardTitle } from "@/components/Card";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import Drawer from "@/components/Drawer";

type Project = {
  id: number;
  title: string;
  status: string;
  budget: number;
  progress_pct?: number | null;
  proc_status?: string | null;
  region?: string | null;
  province?: string | null;
};

type Event = {
  id: number;
  project_id: number;
  type: string;
  stage: string | null;
  title: string | null;
  notes: string | null;
  url: string | null;
  amount: number | null;
  happened_at: string;
};

// formatters
const fmtInt = (n: number) => new Intl.NumberFormat().format(n);
const fmtPhpCompact = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export default function Dashboard() {
  const API = process.env.NEXT_PUBLIC_API;
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // controlled by Shell header events
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);

  // create-project modal
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", status: "planned", budget: 0 });

  const token = () => localStorage.getItem("token");

  useEffect(() => {
    const t = token();
    if (!t) {
      location.href = "/login";
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const [projR, evR] = await Promise.all([
          fetch(`${API}/projects`, { headers: { Authorization: `Bearer ${t}` } }),
          fetch(`${API}/procurement/events`, { headers: { Authorization: `Bearer ${t}` } }),
        ]);
        if (!projR.ok) throw new Error(`Projects HTTP ${projR.status}`);
        setProjects(await projR.json());
        setEvents(evR.ok ? await evR.json() : []);
        setErr(null);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [API]);

  // listen for header events from Shell
  useEffect(() => {
    const onSearch = (e: WindowEventMap["ap:search"]) => {
      setQuery(typeof e.detail === "string" ? e.detail : "");
    };
    const onNotif = (_e: WindowEventMap["ap:open-notifications"]) => setNotifOpen(true);
    const onMsg = (_e: WindowEventMap["ap:open-messages"]) => setMsgOpen(true);
  
    window.addEventListener("ap:search", onSearch);
    window.addEventListener("ap:open-notifications", onNotif);
    window.addEventListener("ap:open-messages", onMsg);
  
    return () => {
      window.removeEventListener("ap:search", onSearch);
      window.removeEventListener("ap:open-notifications", onNotif);
      window.removeEventListener("ap:open-messages", onMsg);
    };
  }, []);
  

  const kpi = useMemo(
    () => ({
      total: projects.length,
      completed: projects.filter((p) => p.status === "completed").length,
      allocated: projects.reduce((s, p) => s + (Number(p.budget) || 0), 0),
    }),
    [projects]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => {
      const region = p.region || "";
      const province = p.province || "";
      const stage = p.proc_status || "";
      return (
        p.title.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        region.toLowerCase().includes(q) ||
        province.toLowerCase().includes(q) ||
        stage.toLowerCase().includes(q)
      );
    });
  }, [projects, query]);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    const t = token();
    if (!t) {
      location.href = "/login";
      return;
    }
    const r = await fetch(`${API}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify({
        title: form.title,
        status: form.status,
        budget: Number(form.budget || 0),
      }),
    });
    if (!r.ok) return alert(`Create failed: ${r.status}`);
    const p = await r.json();
    setProjects((prev) => [p, ...prev]);
    setForm({ title: "", status: "planned", budget: 0 });
    setOpen(false);
  }

  return (
    <main className="max-w-[1600px] mx-auto px-6 2xl:px-10 pb-8 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tenant Dashboard</h1>
        <div className="text-sm text-slate-500">Overview</div>
      </div>

      {err && (
        <Card>
          <CardBody>
            <div className="text-red-700">Dashboard error: {err}</div>
          </CardBody>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
        <Kpi label="Total Projects" value={loading ? "—" : String(kpi.total)} />
        <Kpi label="Allocated Budget" value={loading ? "—" : fmtPhpCompact(kpi.allocated)} subtle />
        <Kpi label="Completed" value={loading ? "—" : String(kpi.completed)} />
        <Kpi label="Open Items" value={String(events.length)} />
      </div>

      {/* Projects table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">Projects</div>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white shadow hover:opacity-90"
          >
            New Project
          </button>
        </div>

        <Card className="overflow-hidden">
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10">
                <tr className="text-left">
                  <th className="py-3 pl-5 pr-3 font-medium">Project</th>
                  <th className="px-3 font-medium">Status</th>
                  <th className="px-3 font-medium">Stage</th>
                  <th className="px-3 font-medium">Budget</th>
                  <th className="px-3 font-medium w-48">Progress</th>
                  <th className="px-5 font-medium text-right">Open</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No matching projects.
                    </td>
                  </tr>
                )}
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t hover:bg-slate-50 cursor-pointer"
                    onClick={() => router.push(`/projects/${p.id}`)}
                    onKeyDown={(e) => e.key === "Enter" && router.push(`/projects/${p.id}`)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open ${p.title}`}
                  >
                    <td className="py-4 pl-5 pr-3">
                      <div className="font-medium">{p.title}</div>
                      {(p.region || p.province) && (
                        <div className="text-xs text-slate-500">
                          {p.region}
                          {p.province ? ` • ${p.province}` : ""}
                        </div>
                      )}
                    </td>
                    <td className="px-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-3 text-slate-700">{p.proc_status ?? "—"}</td>
                    <td className="px-3">₱{fmtInt(p.budget)}</td>
                    <td className="px-3">
                      <ProgressBar
                        value={typeof p.progress_pct === "number" ? p.progress_pct : 0}
                      />
                    </td>
                    <td className="px-5 text-right">
                      <span className="text-slate-700 underline">Open</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardBody>
          <CardTitle className="mb-3">Recent Activity</CardTitle>
          <ul className="space-y-3">
            {events.slice(0, 8).map((ev) => (
              <li
                key={ev.id}
                className="rounded-xl p-3 bg-white ring-1 ring-slate-200 shadow-sm"
              >
                <div className="text-xs text-slate-500">
                  {new Date(ev.happened_at).toLocaleString()} • {ev.stage ?? ev.type}
                </div>
                <div className="font-medium">{ev.title || ev.type}</div>
                {ev.notes && <div className="text-sm mt-1 line-clamp-2">{ev.notes}</div>}
              </li>
            ))}
            {events.length === 0 && (
              <div className="text-sm text-slate-500">No activity yet.</div>
            )}
          </ul>
        </CardBody>
      </Card>

      {/* Create Project Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Create Project">
        <form onSubmit={createProject} className="grid gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-slate-600">Title</label>
            <input
              className="border p-2 rounded-lg"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-600">Status</label>
            <select
              className="border p-2 rounded-lg"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>planned</option>
              <option>in-progress</option>
              <option>completed</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-600">Budget</label>
            <input
              type="number"
              className="border p-2 rounded-lg"
              value={form.budget}
              onChange={(e) =>
                setForm({ ...form, budget: Number(e.target.value || 0) })
              }
            />
          </div>
          <div className="pt-1">
            <button className="px-4 py-2 rounded-lg bg-slate-900 text-white shadow hover:opacity-90">
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Drawers (opened by Shell header) */}
      <Drawer open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications">
        {events.slice(0, 12).map((ev) => (
          <div key={ev.id} className="border-b py-3">
            <div className="text-xs text-slate-500">
              {new Date(ev.happened_at).toLocaleString()} • {ev.stage ?? ev.type}
            </div>
            <div className="font-medium">{ev.title || ev.type}</div>
            {ev.notes && <div className="text-sm mt-1">{ev.notes}</div>}
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-sm text-slate-500">No notifications yet.</div>
        )}
      </Drawer>

      <Drawer open={msgOpen} onClose={() => setMsgOpen(false)} title="Messages">
        <div className="text-sm text-slate-500">No messages yet. (Placeholder)</div>
      </Drawer>
    </main>
  );
}

function Kpi({
  label,
  value,
  subtle = false,
}: {
  label: string;
  value: string;
  subtle?: boolean;
}) {
  return (
    <Card className="shadow-card hover:shadow-card-lg transition-shadow">
      <CardBody>
        <CardTitle>{label}</CardTitle>
        <div className={`mt-1 font-semibold ${subtle ? "text-2xl" : "text-3xl"}`}>
          {value}
        </div>
      </CardBody>
    </Card>
  );
}
