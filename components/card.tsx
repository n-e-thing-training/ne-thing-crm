import { ReactNode } from "react";

interface CardProps {
  title: string;
  value: string | number;
  hint?: string;
  children?: ReactNode;
}

export function Card({ title, value, hint, children }: CardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      {children}
    </section>
  );
}
