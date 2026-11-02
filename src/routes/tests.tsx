import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { runTestCases, type TestCaseResult } from "@/lib/os/testCases";
import { useOS } from "@/lib/os/store";
import { Badge, Btn, PageHeader, Panel } from "@/components/os/ui";

export const Route = createFileRoute("/tests")({
  head: () => ({
    meta: [
      { title: "Test Cases — DeadlockLab" },
      {
        name: "description",
        content: "Six test cases executed live against the algorithm module.",
      },
      { property: "og:title", content: "Test Cases — DeadlockLab" },
      {
        property: "og:description",
        content: "Safe state, unsafe request, deadlock, prevention and boundary tests.",
      },
    ],
  }),
  component: Tests,
});

function Tests() {
  const os = useOS();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [results, setResults] = useState<TestCaseResult[]>([]);
  const [err, setErr] = useState("");
  const run = () => {
    setState("loading");
    setTimeout(() => {
      try {
        const r = runTestCases();
        setResults(r);
        setState("done");
        os.log(
          `Test suite: ${r.filter((t) => t.pass).length}/${r.length} passed`,
          r.every((t) => t.pass) ? "ok" : "err",
        );
      } catch (e) {
        setErr(String(e));
        setState("error");
      }
    }, 300);
  };
  const passed = results.filter((t) => t.pass).length;
  return (
    <>
      <PageHeader eyebrow="Verification" title="Test cases">
        Each case is executed against the algorithm module at run time; results shown are actual
        outputs, not pre-written.
      </PageHeader>
      <div className="mb-6 flex items-center gap-3">
        <Btn variant="primary" onClick={run} disabled={state === "loading"}>
          {state === "loading" ? "Running…" : "Run all tests"}
        </Btn>
        {state === "done" && (
          <Badge tone={passed === results.length ? "ok" : "err"}>
            {passed}/{results.length} PASSED
          </Badge>
        )}
      </div>
      {state === "error" && (
        <Panel>
          <p className="text-sm text-destructive">Test run failed: {err}</p>
        </Panel>
      )}
      {state === "idle" && (
        <Panel>
          <p className="py-10 text-center text-sm text-muted-foreground">
            No results yet — press “Run all tests”.
          </p>
        </Panel>
      )}
      {state === "loading" && (
        <Panel>
          <p className="animate-pulse py-10 text-center font-mono text-sm text-muted-foreground">
            Executing TC1…TC6
          </p>
        </Panel>
      )}
      {state === "done" && (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((t) => (
            <Panel
              key={t.id}
              title={`${t.id} · ${t.title}`}
              action={<Badge tone={t.pass ? "ok" : "err"}>{t.pass ? "PASS" : "FAIL"}</Badge>}
            >
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <dl className="mt-3 space-y-1 font-mono text-xs">
                <div className="flex gap-2">
                  <dt className="w-20 text-muted-foreground">expected</dt>
                  <dd>{t.expected}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 text-muted-foreground">actual</dt>
                  <dd className={t.pass ? "text-success" : "text-destructive"}>{t.actual}</dd>
                </div>
              </dl>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
