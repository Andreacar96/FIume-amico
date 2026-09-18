import Link from "next/link";
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center gap-2 rounded-[3px] px-5 py-2.5 text-sm font-medium transition-colors border cursor-pointer";

const variants = {
  primary: "bg-primary text-bg border-transparent hover:bg-primary-light",
  ghost: "bg-transparent border-border text-text hover:border-primary",
  accent: "bg-accent text-white border-transparent hover:opacity-90",
};

type Variant = keyof typeof variants;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}

export function LinkButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function SectionHead({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
      <div>
        <h2 className="text-2xl">{title}</h2>
        {description && (
          <p className="text-text-muted mt-1.5 max-w-[52ch]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2.5 py-1 rounded-full bg-bg-alt text-text-muted">
      {children}
    </span>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5">
      <label className="block text-[0.82rem] text-text-muted mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 border border-border rounded-md bg-bg text-text text-[0.92rem] focus:outline-none focus:border-primary";

export function Input(props: ComponentProps<"input">) {
  return <input className={inputClass} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${inputClass} min-h-16 resize-y ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${inputClass} ${className}`} {...props} />;
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface border border-border rounded-md ${className}`}>
      {children}
    </div>
  );
}
