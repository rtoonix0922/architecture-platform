import * as React from "react";

export default function Modal({
  open, onClose, title, children
}: { open:boolean; onClose:()=>void; title:string; children:React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-card-lg w-full max-w-lg">
          <div className="p-5 border-b">
            <div className="text-lg font-semibold">{title}</div>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
