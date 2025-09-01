"use client";
import { useRef } from "react";
import { Bell, MessageSquare, Search } from "lucide-react";

/** Emits:
 *  - "ap:search" (detail: string)
 *  - "ap:open-notifications"
 *  - "ap:open-messages"
 */
export default function TopBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const emit = (type: string, detail?: any) =>
    window.dispatchEvent(new CustomEvent(type, { detail }));

  return (
    <div className="px-6 2xl:px-10 py-3 bg-white border-b border-slate-100">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
        {/* Search (left) */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              onChange={(e) => emit("ap:search", e.target.value)}
              placeholder="Search projects, status, stage, region…"
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              aria-label="Search projects"
            />
          </div>
        </div>

        {/* Icons (right) */}
        <div className="flex items-center gap-2">
          <button
            title="Notifications"
            onClick={() => emit("ap:open-notifications")}
            className="rounded-xl p-2 ring-1 ring-slate-200 bg-white hover:shadow-sm transition"
            aria-label="Open notifications"
          >
            <Bell size={18} />
          </button>
          <button
            title="Messages"
            onClick={() => emit("ap:open-messages")}
            className="rounded-xl p-2 ring-1 ring-slate-200 bg-white hover:shadow-sm transition"
            aria-label="Open messages"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
