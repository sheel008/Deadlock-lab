import type { Matrix } from "@/lib/os/algorithms";

/** Process/resource relationship graph: R→P = holds, P→R = waits. */
export function RAG({
  allocation,
  request,
  deadlocked = [],
}: {
  allocation: Matrix;
  request: Matrix;
  deadlocked?: number[];
}) {
  const n = allocation.length,
    m = allocation[0]?.length ?? 0;
  const H = Math.max(n, m) * 64 + 40,
    W = 460;
  const py = (i: number) =>
    40 + i * ((H - 80) / Math.max(1, n - 1 || 1)) + (n === 1 ? (H - 80) / 2 : 0);
  const ry = (j: number) =>
    40 + j * ((H - 80) / Math.max(1, m - 1 || 1)) + (m === 1 ? (H - 80) / 2 : 0);
  const PX = 70,
    RX = W - 70;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xl">
      <defs>
        {["hold", "wait", "dead"].map((k) => (
          <marker
            key={k}
            id={`a-${k}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path
              d="M0,0 L10,5 L0,10 z"
              className={
                k === "hold" ? "fill-chart-2" : k === "wait" ? "fill-primary" : "fill-destructive"
              }
            />
          </marker>
        ))}
      </defs>
      {allocation.map((row, i) =>
        row.map(
          (x, j) =>
            x > 0 && (
              <g key={`h${i}${j}`}>
                <line
                  x1={RX - 18}
                  y1={ry(j)}
                  x2={PX + 20}
                  y2={py(i)}
                  strokeWidth={1.5}
                  markerEnd={`url(#a-${deadlocked.includes(i) ? "dead" : "hold"})`}
                  className={deadlocked.includes(i) ? "stroke-destructive" : "stroke-chart-2"}
                />
                <text
                  x={(RX + PX) / 2 - 30}
                  y={(ry(j) + py(i)) / 2 - 4}
                  className="fill-chart-2 font-mono text-[10px]"
                >
                  {x}
                </text>
              </g>
            ),
        ),
      )}
      {request.map((row, i) =>
        row.map(
          (x, j) =>
            x > 0 && (
              <g key={`w${i}${j}`}>
                <line
                  x1={PX + 20}
                  y1={py(i) + 4}
                  x2={RX - 18}
                  y2={ry(j) + 4}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  markerEnd={`url(#a-${deadlocked.includes(i) ? "dead" : "wait"})`}
                  className={deadlocked.includes(i) ? "stroke-destructive" : "stroke-primary"}
                />
                <text
                  x={(RX + PX) / 2 + 24}
                  y={(ry(j) + py(i)) / 2 + 14}
                  className="fill-primary font-mono text-[10px]"
                >
                  {x}
                </text>
              </g>
            ),
        ),
      )}
      {allocation.map((_, i) => (
        <g key={`p${i}`}>
          <circle
            cx={PX}
            cy={py(i)}
            r={20}
            className={
              deadlocked.includes(i)
                ? "fill-destructive/20 stroke-destructive"
                : "fill-card stroke-border"
            }
            strokeWidth={2}
          />
          <text
            x={PX}
            y={py(i) + 4}
            textAnchor="middle"
            className="fill-foreground font-mono text-xs"
          >
            P{i}
          </text>
        </g>
      ))}
      {Array.from({ length: m }, (_, j) => (
        <g key={`r${j}`}>
          <rect
            x={RX - 18}
            y={ry(j) - 18}
            width={36}
            height={36}
            rx={4}
            className="fill-secondary stroke-chart-2"
            strokeWidth={2}
          />
          <text
            x={RX}
            y={ry(j) + 4}
            textAnchor="middle"
            className="fill-foreground font-mono text-xs"
          >
            R{j}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function RAGLegend() {
  return (
    <div className="flex flex-wrap gap-4 font-mono text-xs text-muted-foreground">
      <span>
        <span className="text-chart-2">━▶</span> R holds-by P
      </span>
      <span>
        <span className="text-primary">┅▶</span> P waits-for R
      </span>
      <span>
        <span className="text-destructive">●</span> deadlocked
      </span>
    </div>
  );
}
