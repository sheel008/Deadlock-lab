import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useOS } from "@/lib/os/store";
import { useDerived } from "@/lib/os/useDerived";
import { Btn, Callout, MatrixGrid, PageHeader, Panel, VectorInput } from "@/components/os/ui";

export const Route = createFileRoute("/allocation")({
  head: () => ({
    meta: [
      { title: "Resource Allocation — DeadlockLab" },
      { name: "description", content: "Edit Allocation, Max and Available inputs." },
      { property: "og:title", content: "Resource Allocation — DeadlockLab" },
      { property: "og:description", content: "Editable allocation and maximum matrices." },
    ],
  }),
  component: Allocation,
});

function Counter({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Btn onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        −
      </Btn>
      <span className="w-6 text-center font-mono">{value}</span>
      <Btn onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        +
      </Btn>
    </div>
  );
}

function Allocation() {
  const os = useOS();
  const { errors, need, safety } = useDerived();
  const nav = useNavigate();
  const n = os.allocation.length,
    m = os.available.length;
  return (
    <>
      <PageHeader eyebrow="Inputs / Allocation" title="Resource allocation">
        Edit matrices directly. Values must be non-negative integers and Allocation ≤ Max.
      </PageHeader>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Counter label="Processes" value={n} min={1} max={10} onChange={(v) => os.resize(v, m)} />
        <Counter
          label="Resource types"
          value={m}
          min={1}
          max={6}
          onChange={(v) => os.resize(n, v)}
        />
        <div className="ml-auto flex gap-2">
          <Btn onClick={os.loadSample}>Load sample</Btn>
          <Btn variant="danger" onClick={os.reset}>
            Reset
          </Btn>
          <Btn
            variant="primary"
            disabled={errors.length > 0}
            onClick={() => {
              os.log(
                safety?.safe
                  ? `Safety check: SAFE (${safety.sequence.map((i) => `P${i}`).join("→")})`
                  : "Safety check: UNSAFE",
                safety?.safe ? "ok" : "warn",
              );
              nav({ to: "/bankers" });
            }}
          >
            Run analysis →
          </Btn>
        </div>
      </div>
      {errors.length > 0 && (
        <div className="mb-6">
          <Callout tone="err" title={`${errors.length} validation error(s)`}>
            <ul className="list-disc pl-5">
              {errors.slice(0, 5).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Callout>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Allocation">
          <MatrixGrid
            data={os.allocation}
            onChange={os.setAllocation}
            invalid={(i, j) => os.allocation[i][j] > os.max[i][j]}
          />
        </Panel>
        <Panel title="Maximum">
          <MatrixGrid data={os.max} onChange={os.setMax} />
        </Panel>
        <Panel title="Need = Max − Allocation (derived)">
          <MatrixGrid data={need} invalid={(i, j) => !(need[i][j] >= 0)} />
        </Panel>
        <Panel title="Available vector" className="xl:col-span-3">
          <VectorInput data={os.available} onChange={os.setAvailable} />
        </Panel>
      </div>
    </>
  );
}
