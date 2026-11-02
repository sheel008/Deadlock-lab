import { createFileRoute } from "@tanstack/react-router";
import { useDerived } from "@/lib/os/useDerived";
import { Badge, Callout, MatrixGrid, PageHeader, Panel, vec } from "@/components/os/ui";

export const Route = createFileRoute("/bankers")({
  head: () => ({
    meta: [
      { title: "Banker's Algorithm — DeadlockLab" },
      {
        name: "description",
        content: "Step-by-step Banker's safety analysis with work vector progression.",
      },
      { property: "og:title", content: "Banker's Algorithm — DeadlockLab" },
      { property: "og:description", content: "Safe sequence and work vector visualisation." },
    ],
  }),
  component: Bankers,
});

function Bankers() {
  const { errors, need, safety, state } = useDerived();
  return (
    <>
      <PageHeader eyebrow="Avoidance / Banker's" title="Banker's safety analysis">
        Determines whether a safe sequence exists. An unsafe state means deadlock is possible — not
        that one currently exists.
      </PageHeader>
      {errors.length > 0 || !safety ? (
        <Callout tone="err" title="Cannot run: invalid input">
          {errors[0]}
        </Callout>
      ) : (
        <div className="space-y-6">
          {safety.safe ? (
            <Callout tone="ok" title="SAFE STATE">
              A safe sequence exists for all {state.allocation.length} processes.
            </Callout>
          ) : (
            <Callout tone="warn" title="UNSAFE STATE">
              No process in {"{"}
              {safety.finish
                .map((f, i) => (f ? null : `P${i}`))
                .filter(Boolean)
                .join(", ")}
              {"}"} can finish with Work {vec(safety.finalWork)}. This is not a deadlock verdict —
              see Deadlock Detection.
            </Callout>
          )}
          <Panel title="Safe sequence">
            <div className="flex flex-wrap items-center gap-2">
              {safety.sequence.length === 0 && (
                <span className="text-sm text-muted-foreground">No process could start.</span>
              )}
              {safety.sequence.map((p, k) => (
                <span key={p} className="flex items-center gap-2">
                  <span className="rounded-md border border-success/40 bg-success/10 px-3 py-2 font-mono text-success">
                    P{p}
                  </span>
                  {k < safety.sequence.length - 1 && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </span>
              ))}
              {safety.finish.map(
                (f, i) =>
                  !f && (
                    <span
                      key={i}
                      className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 font-mono text-warning"
                    >
                      P{i} ✕
                    </span>
                  ),
              )}
            </div>
          </Panel>
          <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
            <Panel title="Need matrix">
              <MatrixGrid data={need} />
            </Panel>
            <Panel title="Step-by-step work vector">
              <table className="w-full font-mono text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr>
                    <th className="py-1 text-left">Step</th>
                    <th className="text-left">Process</th>
                    <th className="text-left">Need ≤ Work</th>
                    <th className="text-left">Work before</th>
                    <th className="text-left">Work after</th>
                  </tr>
                </thead>
                <tbody>
                  {safety.steps.map((s, k) => (
                    <tr key={k} className="border-t border-border">
                      <td className="py-2">{k + 1}</td>
                      <td>
                        <Badge tone="ok">P{s.process}</Badge>
                      </td>
                      <td>
                        {vec(s.need)} ≤ {vec(s.workBefore)}
                      </td>
                      <td>{vec(s.workBefore)}</td>
                      <td className="text-primary">{vec(s.workAfter)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
