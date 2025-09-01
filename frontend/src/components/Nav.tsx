"use client";

export default function Nav() {
  const logout = () => {
    localStorage.clear();
    location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
      <nav className="container mx-auto px-4 h-14 flex items-center gap-6">
        <a href="/dashboard" className="font-semibold tracking-tight">ArchiPlatform</a>
        <a href="/dashboard" className="text-sm hover:underline">Dashboard</a>
        <a href="/inquiries" className="text-sm hover:underline">Inquiries</a>
        <button
          className="ml-auto text-sm text-slate-600 hover:text-slate-900 hover:underline"
          onClick={logout}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
