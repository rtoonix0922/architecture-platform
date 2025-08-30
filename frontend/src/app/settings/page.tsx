export default function Settings() {
  return (
    <main className="max-w-5xl mx-auto px-6 md:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-slate-600 mt-1">
            Display name, email, and password (coming soon).
          </p>
        </div>
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold">Tenant</h2>
          <p className="text-sm text-slate-600 mt-1">
            Organization name, logo, and region defaults (coming soon).
          </p>
        </div>
      </section>
    </main>
  );
}
