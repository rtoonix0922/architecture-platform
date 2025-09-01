"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Mail,
  BriefcaseBusiness,
  FolderKanban,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  MessageSquare,
  Search,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inquiries", label: "Inquiries", icon: Mail },
  { href: "/portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { href: "/projects", label: "Projects", icon: FolderKanban }, // future
  { href: "/settings", label: "Settings", icon: Settings },      // future
];

function Sidebar({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const Link = ({
    href,
    children,
    active,
    Icon,
  }: {
    href: string;
    children: React.ReactNode;
    active: boolean;
    Icon: NavItem["icon"];
  }) => (
    <a
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
        ${active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"}`}
      onClick={onClose}
    >
      <Icon size={18} />
      <span>{children}</span>
    </a>
  );

  const logout = () => {
    localStorage.clear();
    location.href = "/login";
  };

  return (
    <>
      {/* overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/30 md:hidden transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* fixed rail */}
      <aside
        className={`fixed z-20 top-0 left-0 h-full w-64 bg-white shadow-xl ring-1 ring-slate-200/70
        transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-14 flex items-center px-4 ring-1 ring-inset ring-slate-200/70">
          <span className="font-semibold tracking-tight">ArchiPlatform</span>
          <button className="ml-auto md:hidden" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 grid gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              Icon={n.icon}
              active={pathname === n.href}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto absolute bottom-0 w-full p-3 ring-1 ring-inset ring-slate-200/70 bg-white">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm
                       text-slate-700 hover:bg-slate-100 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // ---- AUTH PAGES (no sidebar/topbar) ----
  const isAuthRoute = pathname === "/login" || pathname?.startsWith("/auth/");
  if (isAuthRoute) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-slate-100">
        <main className="min-h-dvh grid place-items-center p-6">{children}</main>
      </div>
    );
  }

  // close drawer on route change (mobile)
  useEffect(() => void setOpen(false), [pathname]);

  // cross-page event helper (header -> dashboard)
  const emit = (type: string, detail?: any) =>
    window.dispatchEvent(new CustomEvent(type, { detail }));

  return (
    <div className="min-h-dvh md:pl-64 bg-gradient-to-b from-slate-50 to-slate-100">
      {/* top header */}
      <header className="sticky top-0 z-10 h-14 bg-white/80 backdrop-blur-md ring-1 ring-slate-200/70 flex items-center gap-3 px-4 md:px-6">
        {/* mobile menu button */}
        <button
          className="md:hidden -ml-1 p-2 rounded-lg hover:bg-slate-100"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* search (fills available space) */}
        <div className="flex-1">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search projects, status, stage, region…"
              onChange={(e) => emit("ap:search", e.target.value)}
              aria-label="Search projects"
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        {/* icons pinned to the far right */}
        <div className="ml-auto flex items-center gap-2">
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
      </header>

      <Sidebar open={open} onClose={() => setOpen(false)} pathname={pathname} />

      {/* page container */}
      <main className="max-w-6xl mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
