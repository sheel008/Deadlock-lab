import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useOS } from "@/lib/os/store";
import { resourceRequest, computeNeed, type RequestOutcome } from "@/lib/os/algorithms";
import { Btn, Callout, MatrixGrid, PageHeader, Panel, VectorInput, vec } from "@/components/os/ui";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Resource Requests — DeadlockLab" },
      {
        name: "description",
        content: "Validate and simulate resource requests with Banker's algorithm.",
      },
      { property: "og:title", content: "Resource Requests — DeadlockLab" },
      {
        property: "og:description",
        content: "Grant or deny requests with before/after comparison.",
      },
    ],
  }),
  component: Requests,
});

const label: Record<RequestOutcome["status"], [string, "ok" | "warn" | "err"]> = {
  granted: ["GRANTED", "ok"],
  "denied-unsafe": ["DENIED — UNSAFE", "warn"],
  "must-wait": ["WAIT — EXCEEDS AVAILABLE", "warn"],
  "exceeds-need": ["ERROR — EXCEEDS NEED", "err"],
  invalid: ["INVALID", "err"],
};

function Requests() {
  const os = useOS();
  const m = os.available.length;
  const [pid, setPid] = useState(0);
  const [req, setReq] = useState<number[]>(Array(m).fill(0));
  const [res, setRes] = useState<RequestOutcome | null>(null);
  const r = req.length === m ? req : Array(m).fill(0);
  const need = computeNeed(os.max, os.allocation);

  const run = () => {
    const out = resourceRequest(
      { allocation: os.allocation, max: os.max, available: os.available },
      pid,
      r,
    );
    setRes(out);
    os.log(`P${pid} requests ${vec(r)}: ${label[out.status][0]}`, label[out.status][1]);
  };
  const commit = () => {
    if (res?.status !== "granted") return;
    os.setAllocation(res.after.allocation);
    os.setAvailable(res.after.available);
    os.log(`Committed P${pid}'s request to system state`, "ok");
    setRes(null);
  };

  return (
    <>
      <PageHeader eyebrow="Avoidance / Requests" title="Resource request simulation">
        Checks Request ≤ Need, Request ≤ Available, then runs the safety algorithm on the tentative
        state.
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Panel title="New request">
          <label className="mb-1 block text-sm text-muted-foreground">Process</label>
          <select
            value={pid}
            onChange={(e) => {
              setPid(Number(e.target.value));
              setRes(null);
            }}
            className="mb-4 h-9 w-full rounded border border-border bg-input px-2 font-mono"
          >
            {os.allocation.map((_, i) => (
              <option key={i} value={i}>
                P{i} — need {vec(need[i])}
              </option>
            ))}
          </select>
          <p className="mb-1 text-sm text-muted-foreground">Request vector</p>
          <VectorInput
            data={r}
            onChange={(v) => {
              setReq(v);
              setRes(null);
            }}
          />
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            Available {vec(os.available)}
          </p>
          <Btn variant="primary" className="mt-4 w-full justify-center" onClick={run}>
            Validate request
          </Btn>
        </Panel>
        <div className="space-y-6">
          {!res ? (
            <Panel>
              <p className="py-10 text-center text-sm text-muted-foreground">
                Choose a process, enter a request and validate.
              </p>
            </Panel>
          ) : (
            <>
              <Callout tone={label[res.status][1]} title={label[res.status][0]}>
                {res.reason}
                {"safety" in res && res.safety.safe && (
                  <p className="mt-1 font-mono">
                    Safe sequence: {res.safety.sequence.map((i) => `P${i}`).join(" → ")}
                  </p>
                )}
              </Callout>
              {"after" in res && (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Panel title="Allocation — before">
                      <MatrixGrid data={os.allocation} highlightRows={[pid]} />
                      <p className="mt-3 font-mono text-xs">Available {vec(os.available)}</p>
                    </Panel>
                    <Panel
                      title={
                        res.status === "granted"
                          ? "Allocation — after"
                          : "Allocation — tentative (rolled back)"
                      }
                    >
                      <MatrixGrid data={res.after.allocation} highlightRows={[pid]} />
                      <p className="mt-3 font-mono text-xs">Available {vec(res.after.available)}</p>
                    </Panel>
                  </div>
                  {res.status === "granted" && (
                    <Btn variant="primary" onClick={commit}>
                      Commit to system state
                    </Btn>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
