import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useOS } from "@/lib/os/store";
import { applyHoldAndWait, applyResourceOrdering, detectDeadlock } from "@/lib/os/algorithms";
import { Callout, PageHeader, Panel } from "@/components/os/ui";
import { RAG, RAGLegend } from "@/components/os/RAG";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prevention")({
  head: () => ({
    meta: [
      { title: "Deadlock Prevention — DeadlockLab" },
      {
        name: "description",
        content: "Compare resource ordering and hold-and-wait prevention policies.",
      },
      { property: "og:title", content: "Deadlock Prevention — DeadlockLab" },
      {
        property: "og:description",
        content: "Original vs modified scenario under prevention policies.",
      },
    ],
  }),
  component: Prevention,
});

const policies = {
  ordering: {
    name: "Fixed resource ordering",
    fn: applyResourceOrdering,
    breaks: "Circular wait",
    tradeoff:
      "Simple to enforce, but forces processes to request resources in a global order even when they need a later one first — can cause early acquisition and lower utilisation.",
  },
  hold: {
    name: "No hold-and-wait",
    fn: applyHoldAndWait,
    breaks: "Hold and wait",
    tradeoff:
      "Eliminates partial holding, but processes must request everything up front — reduces concurrency and risks starvation of processes needing many popular resources.",
  },
};

function Prevention() {
  const os = useOS();
  const [key, setKey] = useState<keyof typeof policies>("ordering");
  const p = policies[key];
  const original = { allocation: os.allocation, request: os.request, available: os.available };
  const valid = os.allocation
    .flat()
    .concat(os.request.flat(), os.available)
    .every((x) => Number.isInteger(x) && x >= 0);
  if (!valid)
    return (
      <>
        <PageHeader eyebrow="Prevention" title="Deadlock prevention" />
        <Callout tone="err" title="Invalid input">
          Fix Allocation/Request/Available values first.
        </Callout>
      </>
    );
  const res = p.fn(original);
  const dO = detectDeadlock(original.available, original.allocation, original.request);
  const dM = detectDeadlock(res.modified.available, res.modified.allocation, res.modified.request);
  const verdict = (d: typeof dO) =>
    d.deadlocked.length ? (
      <Callout tone="err" title={`Deadlock: ${d.deadlocked.map((i) => `P${i}`).join(", ")}`} />
    ) : (
      <Callout tone="ok" title="No deadlock" />
    );

  return (
    <>
      <PageHeader eyebrow="Prevention" title="Deadlock prevention policies">
        Apply a policy to the current Allocation/Request scenario (from Detection) and compare
        outcomes.
      </PageHeader>
      <div className="mb-6 grid gap-3 md:grid-cols-2">
        {(Object.keys(policies) as (keyof typeof policies)[]).map((k) => (
          <button
            key={k}
            onClick={() => setKey(k)}
            className={cn(
              "rounded-lg border p-4 text-left transition-colors",
              k === key ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-accent",
            )}
          >
            <p className="font-medium">{policies[k].name}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Breaks condition: {policies[k].breaks}
            </p>
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Original scenario" action={<RAGLegend />}>
          <RAG
            allocation={original.allocation}
            request={original.request}
            deadlocked={dO.deadlocked}
          />
          <div className="mt-3">{verdict(dO)}</div>
        </Panel>
        <Panel title={`Modified — ${p.name}`}>
          <RAG
            allocation={res.modified.allocation}
            request={res.modified.request}
            deadlocked={dM.deadlocked}
          />
          <div className="mt-3">{verdict(dM)}</div>
        </Panel>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Policy effects">
          {res.notes.length ? (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {res.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No process violates this policy in the current scenario.
            </p>
          )}
        </Panel>
        <Panel title="Trade-off">
          <p className="text-sm text-muted-foreground">{p.tradeoff}</p>
        </Panel>
      </div>
    </>
  );
}
