import "./globals.css";
import Shell from "@/components/Shell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
