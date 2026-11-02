import { createFileRoute, Link } from "@tanstack/react-router";
import { useOS } from "@/lib/os/store";
import { useDerived } from "@/lib/os/useDerived";
import { Badge, PageHeader, Panel, vec } from "@/components/os/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — DeadlockLab" },
      {
        name: "description",
        content: "System overview of processes, resources and safety status.",
      },
      { property: "og:title", content: "DeadlockLab — OS Deadlock Analysis Dashboard" },
      {
        property: "og:description",
        content: "Banker's algorithm, deadlock detection and prevention in one dashboard.",
      },
    ],
  }),
  component: Overview,
});

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="mt-3 font-mono text-3xl font-semibold">{value}</div>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Overview() {
  const os = useOS();
  const { errors, safety } = useDerived();
  const status = errors.length ? (
    <Badge tone="err">INVALID INPUT</Badge>
  ) : safety?.safe ? (
    <Badge tone="ok">SAFE</Badge>
  ) : (
    <Badge tone="warn">UNSAFE</Badge>
  );
  return (
    <>
      <PageHeader eyebrow="System / Overview" title="Resource allocation at a glance">
        Live summary of the current system state. Safety status comes from the Banker's safety
        check; it is not a deadlock verdict.
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Processes" value={os.allocation.length} />
        <Stat label="Resource types" value={os.available.length} />
        <Stat label="Available" value={<span className="text-2xl">{vec(os.available)}</span>} />
        <Stat
          label="Safety status"
          value={status}
          sub={
            safety?.safe
              ? `Sequence: ${safety.sequence.map((i) => `P${i}`).join(" → ")}`
              : errors[0]
          }
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Recent analysis activity" className="lg:col-span-2">
          {os.activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No analysis run yet. Start in{" "}
              <Link to="/allocation" className="text-primary underline">
                Resource Allocation
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {os.activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 py-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{a.time}</span>
                  <Badge tone={a.tone}>{a.tone.toUpperCase()}</Badge>
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Modules">
          <ul className="space-y-2 text-sm">
            {[
              ["/bankers", "Banker's safety check"],
              ["/requests", "Resource-request algorithm"],
              ["/detection", "Deadlock detection"],
              ["/prevention", "Prevention policies"],
              ["/tests", "Verified test cases"],
            ].map(([to, l]) => (
              <li key={to}>
                <Link
                  to={to as "/"}
                  className="flex justify-between rounded px-2 py-1.5 hover:bg-accent"
                >
                  {l}
                  <span className="text-primary">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
