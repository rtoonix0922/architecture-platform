"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardTitle } from "@/components/Card";

type Inquiry = {
  id: number;
  name: string | null;
  email: string | null;
  message: string | null;
  created_at: string;
};

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

export default function InquiriesPage() {
  const API = process.env.NEXT_PUBLIC_API;
  const [items, setItems] = useState<Inquiry[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const token = () => localStorage.getItem("token");
  const ensureAuth = () => { if (!token()) location.href = "/login"; };

  useEffect(() => {
    ensureAuth();
    const t = token(); if (!t) return;

    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`${API}/inquiries`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (r.status === 401) { localStorage.clear(); location.href = "/login"; return; }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setItems(await r.json());
        setErr(null);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load inquiries");
      } finally {
        setLoading(false);
      }
    })();
  }, [API]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(it =>
      (it.name || "").toLowerCase().includes(s) ||
      (it.email || "").toLowerCase().includes(s) ||
      (it.message || "").toLowerCase().includes(s)
    );
  }, [items, q]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Inquiries</h1>

      <Card className="shadow-md">
        <CardBody>
          <div className="flex items-center gap-3">
            <input
              className="border p-2 rounded-lg flex-1"
              placeholder="Search name, email, or message…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <span className="text-xs text-slate-500">{filtered.length} results</span>
          </div>
        </CardBody>
      </Card>

      {err && (
        <Card>
          <CardBody>
            <div className="text-red-700">Error: {err}</div>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {loading && (
          <Card><CardBody><div className="text-sm text-slate-500">Loading…</div></CardBody></Card>
        )}
        {!loading && filtered.length === 0 && !err && (
          <Card><CardBody><div className="text-sm text-slate-500">No inquiries yet.</div></CardBody></Card>
        )}
        {filtered.map((i) => (
          <Card key={i.id} className="hover:shadow-md transition-shadow">
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{i.name || "—"}</div>
                  <div className="text-sm text-slate-600">{i.email || "—"}</div>
                </div>
                <div className="text-xs text-slate-500">{fmtDate(i.created_at)}</div>
              </div>
              <p className="text-sm mt-3 whitespace-pre-wrap">{i.message}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
