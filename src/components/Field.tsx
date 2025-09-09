'use client';
import React from "react";
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <div className="mb-1 text-sm text-slate-300">{label}</div>
      {children}
    </label>
  );
}
