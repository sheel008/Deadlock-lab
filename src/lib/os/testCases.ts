import {
  applyHoldAndWait,
  applyResourceOrdering,
  bankersSafety,
  computeNeed,
  detectDeadlock,
  resourceRequest,
  validateState,
  type SystemState,
} from "./algorithms";

export const SAMPLE: SystemState = {
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
  max: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
  available: [3, 3, 2],
};
export const SAMPLE_REQUEST = [
  [0, 0, 0],
  [2, 0, 2],
  [0, 0, 0],
  [1, 0, 0],
  [0, 0, 2],
];

/** Sample state after P1's (1,0,2) request is granted. */
export const SAMPLE_AFTER_P1: SystemState = {
  allocation: [
    [0, 1, 0],
    [3, 0, 2],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
  max: SAMPLE.max,
  available: [2, 3, 0],
};

export const DEADLOCK_SCENARIO = {
  allocation: [
    [1, 0],
    [0, 1],
  ],
  request: [
    [0, 1],
    [1, 0],
  ],
  available: [0, 0],
};

export interface TestCaseResult {
  id: string;
  title: string;
  description: string;
  expected: string;
  actual: string;
  pass: boolean;
}

const fmt = (s: number[]) => s.map((i) => `P${i}`).join(" → ");

export function runTestCases(): TestCaseResult[] {
  const out: TestCaseResult[] = [];

  const s1 = bankersSafety(
    SAMPLE.available,
    SAMPLE.allocation,
    computeNeed(SAMPLE.max, SAMPLE.allocation),
  );
  out.push({
    id: "TC1",
    title: "Safe state",
    description: "Textbook 5×3 state; Banker's safety check.",
    expected: "SAFE, P1 → P3 → P4 → P0 → P2",
    actual: `${s1.safe ? "SAFE" : "UNSAFE"}, ${fmt(s1.sequence)}`,
    pass: s1.safe && fmt(s1.sequence) === "P1 → P3 → P4 → P0 → P2",
  });

  const r2b = resourceRequest(SAMPLE, 0, [0, 4, 0]);
  out.push({
    id: "TC2",
    title: "Request exceeds Available",
    description: "P0 requests (0,4,0): within Need (7,4,3) but exceeds Available (3,3,2).",
    expected: "must-wait",
    actual: r2b.status,
    pass: r2b.status === "must-wait",
  });

  const r3 = resourceRequest(SAMPLE_AFTER_P1, 0, [0, 2, 0]);
  out.push({
    id: "TC3",
    title: "Request produces unsafe state",
    description: "After P1's (1,0,2) is granted, P0 requests (0,2,0).",
    expected: "denied-unsafe",
    actual: r3.status,
    pass: r3.status === "denied-unsafe",
  });

  const d4 = detectDeadlock(
    DEADLOCK_SCENARIO.available,
    DEADLOCK_SCENARIO.allocation,
    DEADLOCK_SCENARIO.request,
  );
  out.push({
    id: "TC4",
    title: "Deadlocked scenario",
    description: "P0 holds R0 wants R1; P1 holds R1 wants R0; Available (0,0).",
    expected: "Deadlocked: P0, P1",
    actual: d4.deadlocked.length
      ? `Deadlocked: ${d4.deadlocked.map((i) => `P${i}`).join(", ")}`
      : "No deadlock",
    pass: d4.deadlocked.join() === "0,1",
  });

  const o = applyResourceOrdering(DEADLOCK_SCENARIO);
  const h = applyHoldAndWait(DEADLOCK_SCENARIO);
  const dO = detectDeadlock(o.modified.available, o.modified.allocation, o.modified.request);
  const dH = detectDeadlock(h.modified.available, h.modified.allocation, h.modified.request);
  out.push({
    id: "TC5",
    title: "Prevention policy",
    description: "Apply resource ordering and hold-and-wait prevention to TC4.",
    expected: "Ordering: no deadlock (P1 affected); Hold-and-wait: no deadlock",
    actual: `Ordering: ${dO.deadlocked.length ? "deadlock" : "no deadlock"} (${o.affected.map((i) => `P${i}`).join(",")} affected); Hold-and-wait: ${dH.deadlocked.length ? "deadlock" : "no deadlock"}`,
    pass: dO.deadlocked.length === 0 && dH.deadlocked.length === 0 && o.affected.join() === "1",
  });

  const bad1 = validateState({ allocation: [[-1, 0]], max: [[1, 1]], available: [1, 1] });
  const bad2 = validateState({ allocation: [[2]], max: [[1]], available: [0] });
  const bad3 = validateState({ allocation: [[1.5]], max: [[2]], available: [0] });
  const bad4 = resourceRequest(SAMPLE, 1, [2, 0, 0]);
  const empty = bankersSafety([1], [], []);
  const ok =
    bad1.length > 0 &&
    bad2.length > 0 &&
    bad3.length > 0 &&
    bad4.status === "exceeds-need" &&
    empty.safe;
  out.push({
    id: "TC6",
    title: "Boundary & invalid inputs",
    description: "Negative value, Allocation > Max, non-integer, request > Need, zero processes.",
    expected: "4 rejections + empty system trivially safe",
    actual: `${[bad1, bad2, bad3].filter((e) => e.length).length + (bad4.status === "exceeds-need" ? 1 : 0)} rejections, empty ${empty.safe ? "safe" : "unsafe"}`,
    pass: ok,
  });

  return out;
}
