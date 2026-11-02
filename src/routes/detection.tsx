import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useOS } from "@/lib/os/store";
import { detectDeadlock, terminateProcess, validateState } from "@/lib/os/algorithms";
import { DEADLOCK_SCENARIO } from "@/lib/os/testCases";
import { Badge, Btn, Callout, MatrixGrid, PageHeader, Panel } from "@/components/os/ui";
import { RAG, RAGLegend } from "@/components/os/RAG";

export const Route = createFileRoute("/detection")({
  head: () => ({
    meta: [
      { title: "Deadlock Detection — DeadlockLab" },
      {
        name: "description",
        content: "Detect deadlocks from current allocations and outstanding requests.",
      },
      { property: "og:title", content: "Deadlock Detection — DeadlockLab" },
      { property: "og:description", content: "Resource relationship graph and recovery actions." },
    ],
  }),
  component: Detection,
});

function Detection() {
  const os = useOS();
  const [ran, setRan] = useState(false);
  const errs = validateState({
    allocation: os.allocation,
    max: os.allocation,
    available: os.available,
  }).concat(
    os.request.flat().some((x) => !Number.isInteger(x) || x < 0)
      ? ["Request values must be non-negative integers."]
      : [],
  );
  const result = errs.length ? null : detectDeadlock(os.available, os.allocation, os.request);

  const apply = (s: { allocation: number[][]; request: number[][]; available: number[] }) => {
    os.setAllocation(s.allocation);
    os.setRequest(s.request);
    os.setAvailable(s.available);
  };
  const run = () => {
    setRan(true);
    if (result)
      os.log(
        result.deadlocked.length
          ? `Detection: deadlock among ${result.deadlocked.map((i) => `P${i}`).join(", ")}`
          : "Detection: no deadlock",
        result.deadlocked.length ? "err" : "ok",
      );
  };

  return (
    <>
      <PageHeader eyebrow="Detection" title="Deadlock detection">
        Uses current Allocation and the outstanding <em>Request</em> matrix (what each process is
        waiting for now) — independent of Banker's Max/Need.
      </PageHeader>
      <div className="mb-6 flex flex-wrap gap-2">
        <Btn variant="primary" onClick={run} disabled={!!errs.length}>
          Run detection
        </Btn>
        <Btn
          onClick={() => {
            apply(DEADLOCK_SCENARIO);
            os.setMax(
              DEADLOCK_SCENARIO.allocation.map((r, i) =>
                r.map((x, j) => x + DEADLOCK_SCENARIO.request[i][j]),
              ),
            );
            setRan(false);
            os.log("Loaded deadlock scenario (TC4)");
          }}
        >
          Load deadlock scenario
        </Btn>
      </div>
      {errs.length > 0 && (
        <div className="mb-6">
          <Callout tone="err" title="Invalid input">
            {errs[0]}
          </Callout>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1fr_auto]">
        <Panel title="Process / resource graph" action={<RAGLegend />}>
          <RAG
            allocation={os.allocation}
            request={os.request}
            deadlocked={ran && result ? result.deadlocked : []}
          />
        </Panel>
        <div className="space-y-6">
          <Panel title="Allocation (held)">
            <MatrixGrid data={os.allocation} />
          </Panel>
          <Panel title="Request (waiting for) — editable">
            <MatrixGrid
              data={os.request}
              onChange={(m) => {
                os.setRequest(m);
                setRan(false);
              }}
            />
          </Panel>
        </div>
      </div>
      {ran && result && (
        <div className="mt-6 space-y-4">
          {result.deadlocked.length ? (
            <Callout
              tone="err"
              title={`DEADLOCK DETECTED — ${result.deadlocked.map((i) => `P${i}`).join(", ")}`}
            >
              These processes cannot complete with any order of releases. Choose a recovery action.
            </Callout>
          ) : (
            <Callout tone="ok" title="NO DEADLOCK">
              All processes can complete. Completion order:{" "}
              {result.order.map((i) => `P${i}`).join(" → ") || "—"}
            </Callout>
          )}
          {result.deadlocked.length > 0 && (
            <Panel title="Recovery actions">
              <div className="flex flex-wrap gap-2">
                {result.deadlocked.map((i) => (
                  <Btn
                    key={i}
                    variant="danger"
                    onClick={() => {
                      apply(
                        terminateProcess(
                          {
                            allocation: os.allocation,
                            request: os.request,
                            available: os.available,
                          },
                          i,
                        ),
                      );
                      os.log(`Recovery: terminated P${i}, released its resources`, "warn");
                    }}
                  >
                    Terminate P{i}
                  </Btn>
                ))}
                <Btn
                  variant="danger"
                  onClick={() => {
                    let s = {
                      allocation: os.allocation,
                      request: os.request,
                      available: os.available,
                    };
                    result.deadlocked.forEach((i) => {
                      s = terminateProcess(s, i);
                    });
                    apply(s);
                    os.log("Recovery: terminated all deadlocked processes", "warn");
                  }}
                >
                  Terminate all deadlocked
                </Btn>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Results update live; press Run detection again to log the new verdict.{" "}
                <Badge>process termination</Badge>
              </p>
            </Panel>
          )}
        </div>
      )}
    </>
  );
}
