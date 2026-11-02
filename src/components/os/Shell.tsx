import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Activity, Grid3x3, ShieldCheck, Send, Network, Lock, FlaskConical } from "lucide-react";

const nav = [
  { to: "/", label: "Overview", icon: Activity },
  { to: "/allocation", label: "Resource Allocation", icon: Grid3x3 },
  { to: "/bankers", label: "Banker's Algorithm", icon: ShieldCheck },
  { to: "/requests", label: "Resource Requests", icon: Send },
  { to: "/detection", label: "Deadlock Detection", icon: Network },
  { to: "/prevention", label: "Deadlock Prevention", icon: Lock },
  { to: "/tests", label: "Test Cases", icon: FlaskConical },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-border bg-sidebar md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="px-5 py-5">
          <p className="font-mono text-lg font-semibold">
            <span className="text-primary">▣</span> DeadlockLab
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            OS resource analysis
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent !text-foreground [&>svg]:text-primary" }}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
