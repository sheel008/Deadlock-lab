import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Matrix, Vec } from "@/lib/os/algorithms";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 border-b border-border pb-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      {children && <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{children}</p>}
    </header>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {title}
          </h2>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

type Tone = "ok" | "warn" | "err" | "info" | "muted";
const toneCls: Record<Tone, string> = {
  ok: "bg-success/15 text-success border-success/30",
  warn: "bg-warning/15 text-warning border-warning/30",
  err: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-primary/15 text-primary border-primary/30",
  muted: "bg-muted text-muted-foreground border-border",
};
export function Badge({ tone = "muted", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-xs",
        toneCls[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("rounded-md border px-4 py-3", toneCls[tone])}>
      <p className="font-mono text-sm font-semibold">{title}</p>
      {children && <div className="mt-1 text-sm text-foreground/80">{children}</div>}
    </div>
  );
}

export function Btn({
  variant = "default",
  className,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "danger" }) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
        variant === "primary" &&
          "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "default" &&
          "border-border bg-secondary text-secondary-foreground hover:bg-accent",
        variant === "danger" &&
          "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
        className,
      )}
    />
  );
}

const parse = (v: string) => (v.trim() === "" ? NaN : Number(v));
const bad = (x: number) => !Number.isInteger(x) || x < 0;

export function MatrixGrid({
  data,
  onChange,
  rowLabel = "P",
  colLabel = "R",
  highlightRows = [],
  invalid,
}: {
  data: Matrix;
  onChange?: (m: Matrix) => void;
  rowLabel?: string;
  colLabel?: string;
  highlightRows?: number[];
  invalid?: (i: number, j: number) => boolean;
}) {
  const m = data[0]?.length ?? 0;
  if (!data.length) return <p className="text-sm text-muted-foreground">No processes defined.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="font-mono text-sm">
        <thead>
          <tr>
            <th />
            {Array.from({ length: m }, (_, j) => (
              <th key={j} className="px-1 pb-1 text-xs font-normal text-muted-foreground">
                {colLabel}
                {j}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className={cn(highlightRows.includes(i) && "bg-primary/10")}>
              <td className="pr-2 text-xs text-muted-foreground">
                {rowLabel}
                {i}
              </td>
              {row.map((x, j) => (
                <td key={j} className="p-0.5">
                  {onChange ? (
                    <input
                      aria-label={`${rowLabel}${i} ${colLabel}${j}`}
                      value={Number.isNaN(x) ? "" : x}
                      onChange={(e) => {
                        const next = data.map((r) => [...r]);
                        next[i][j] = parse(e.target.value);
                        onChange(next);
                      }}
                      className={cn(
                        "h-8 w-12 rounded border bg-input text-center outline-none focus:border-primary",
                        bad(x) || invalid?.(i, j) ? "border-destructive" : "border-border",
                      )}
                    />
                  ) : (
                    <span
                      className={cn(
                        "flex h-8 w-12 items-center justify-center rounded border border-border bg-muted/40",
                        (x < 0 || invalid?.(i, j)) && "text-destructive",
                      )}
                    >
                      {x}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VectorInput({
  data,
  onChange,
  label = "R",
}: {
  data: Vec;
  onChange?: (v: Vec) => void;
  label?: string;
}) {
  return (
    <MatrixGrid
      data={[data]}
      rowLabel=""
      colLabel={label}
      onChange={onChange ? (m) => onChange(m[0]) : undefined}
    />
  );
}

export const vec = (v: Vec) => `[${v.join(", ")}]`;
