"use client";

import { useEffect } from "react";

export function Modal({
  title,
  hint,
  onClose,
  children,
}: {
  title: string;
  hint?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(15,32,39,0.45)] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-2 rounded-md max-w-[460px] w-full p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl mb-1.5">{title}</h3>
        {hint && <p className="text-sm text-text-muted mb-4">{hint}</p>}
        {children}
      </div>
    </div>
  );
}
