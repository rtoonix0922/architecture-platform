import * as React from "react";

export default function Drawer({
  open,
  onClose,
  title,
  children,
  width = 380,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="absolute right-0 top-0 h-full bg-white ring-1 ring-slate-200 shadow-xl flex flex-col"
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="border-b p-4 flex items-center justify-between">
          <div className="text-base font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-md hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
