// Pure OS algorithms — no React. Import from UI, test independently.
export type Vec = number[];
export type Matrix = number[][];

export interface SystemState {
  allocation: Matrix;
  max: Matrix;
  available: Vec;
}

export const leq = (a: Vec, b: Vec) => a.every((x, j) => x <= b[j]);
export const add = (a: Vec, b: Vec) => a.map((x, j) => x + b[j]);
export const sub = (a: Vec, b: Vec) => a.map((x, j) => x - b[j]);
export const clone = (m: Matrix) => m.map((r) => [...r]);
export const zeros = (n: number, m: number): Matrix =>
  Array.from({ length: n }, () => Array(m).fill(0));

const isNonNegInt = (x: number) => Number.isInteger(x) && x >= 0;

export function validateState(s: SystemState): string[] {
  const errs: string[] = [];
  const n = s.allocation.length;
  const m = s.available.length;
  if (n < 1) errs.push("At least one process is required.");
  if (m < 1) errs.push("At least one resource type is required.");
  if (s.max.length !== n) errs.push("Max matrix row count must equal Allocation row count.");
  s.allocation.forEach((row, i) => {
    if (row.length !== m)
      errs.push(`Allocation row P${i} has ${row.length} columns, expected ${m}.`);
  });
  s.max.forEach((row, i) => {
    if (row.length !== m) errs.push(`Max row P${i} has ${row.length} columns, expected ${m}.`);
  });
  if (errs.length) return errs;
  s.available.forEach((x, j) => {
    if (!isNonNegInt(x)) errs.push(`Available[R${j}] must be a non-negative integer.`);
  });
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) {
      const a = s.allocation[i][j];
      const mx = s.max[i][j];
      if (!isNonNegInt(a)) errs.push(`Allocation[P${i}][R${j}] must be a non-negative integer.`);
      if (!isNonNegInt(mx)) errs.push(`Max[P${i}][R${j}] must be a non-negative integer.`);
      if (isNonNegInt(a) && isNonNegInt(mx) && a > mx)
        errs.push(`Allocation[P${i}][R${j}] (${a}) exceeds Max (${mx}).`);
    }
  return errs;
}

export function computeNeed(max: Matrix, allocation: Matrix): Matrix {
  return max.map((row, i) => sub(row, allocation[i]));
}

export interface SafetyStep {
  process: number;
  need: Vec;
  workBefore: Vec;
  workAfter: Vec;
}

export interface SafetyResult {
  safe: boolean;
  sequence: number[];
  steps: SafetyStep[];
  finish: boolean[];
  finalWork: Vec;
}

/** Banker's safety algorithm. Scans cyclically, continuing from the last chosen process. */
export function bankersSafety(available: Vec, allocation: Matrix, need: Matrix): SafetyResult {
  const n = allocation.length;
  let work = [...available];
  const finish = Array(n).fill(false);
  const sequence: number[] = [];
  const steps: SafetyStep[] = [];
  let start = 0;
  while (sequence.length < n) {
    let found = -1;
    for (let k = 0; k < n; k++) {
      const i = (start + k) % n;
      if (!finish[i] && leq(need[i], work)) {
        found = i;
        break;
      }
    }
    if (found < 0) break;
    const before = work;
    work = add(work, allocation[found]);
    finish[found] = true;
    sequence.push(found);
    steps.push({ process: found, need: need[found], workBefore: before, workAfter: work });
    start = (found + 1) % n;
  }
  return { safe: finish.every(Boolean), sequence, steps, finish, finalWork: work };
}

export type RequestOutcome =
  | { status: "invalid"; reason: string }
  | { status: "exceeds-need"; reason: string }
  | { status: "must-wait"; reason: string }
  | { status: "denied-unsafe"; reason: string; after: SystemState; safety: SafetyResult }
  | { status: "granted"; reason: string; after: SystemState; safety: SafetyResult };

/** Resource-request algorithm (Banker's). Does not mutate input. */
export function resourceRequest(s: SystemState, pid: number, request: Vec): RequestOutcome {
  const errs = validateState(s);
  if (errs.length) return { status: "invalid", reason: errs[0] };
  if (pid < 0 || pid >= s.allocation.length)
    return { status: "invalid", reason: "Unknown process." };
  if (request.length !== s.available.length)
    return { status: "invalid", reason: "Request length must equal number of resource types." };
  if (!request.every(isNonNegInt))
    return { status: "invalid", reason: "Request values must be non-negative integers." };
  const need = computeNeed(s.max, s.allocation);
  if (!leq(request, need[pid]))
    return {
      status: "exceeds-need",
      reason: `Request exceeds P${pid}'s declared remaining need [${need[pid].join(", ")}].`,
    };
  if (!leq(request, s.available))
    return {
      status: "must-wait",
      reason: `Request exceeds Available [${s.available.join(", ")}]; P${pid} must wait.`,
    };
  const allocation = clone(s.allocation);
  allocation[pid] = add(allocation[pid], request);
  const after: SystemState = {
    allocation,
    max: clone(s.max),
    available: sub(s.available, request),
  };
  const safety = bankersSafety(
    after.available,
    after.allocation,
    computeNeed(after.max, after.allocation),
  );
  return safety.safe
    ? { status: "granted", reason: "Resulting state is safe; request granted.", after, safety }
    : {
        status: "denied-unsafe",
        reason: "Resulting state would be unsafe; request denied (rolled back).",
        after,
        safety,
      };
}

export interface DetectionResult {
  deadlocked: number[];
  order: number[];
  finalWork: Vec;
}

/** Deadlock detection (multi-instance). Uses current outstanding Request matrix, not Need. */
export function detectDeadlock(
  available: Vec,
  allocation: Matrix,
  request: Matrix,
): DetectionResult {
  const n = allocation.length;
  let work = [...available];
  const finish = allocation.map((row) => row.every((x) => x === 0));
  const order: number[] = [];
  let progress = true;
  while (progress) {
    progress = false;
    for (let i = 0; i < n; i++) {
      if (!finish[i] && leq(request[i], work)) {
        work = add(work, allocation[i]);
        finish[i] = true;
        order.push(i);
        progress = true;
      }
    }
  }
  return {
    deadlocked: finish.map((f, i) => (f ? -1 : i)).filter((i) => i >= 0),
    order,
    finalWork: work,
  };
}

export interface Scenario {
  allocation: Matrix;
  request: Matrix;
  available: Vec;
}

/** Terminate a process: release its allocation, drop its request. */
export function terminateProcess(s: Scenario, pid: number): Scenario {
  const allocation = clone(s.allocation);
  const request = clone(s.request);
  const available = add(s.available, allocation[pid]);
  allocation[pid] = allocation[pid].map(() => 0);
  request[pid] = request[pid].map(() => 0);
  return { allocation, request, available };
}

export interface PreventionResult {
  modified: Scenario;
  affected: number[];
  notes: string[];
}

/**
 * Resource ordering: a process may only request R_j if it holds no R_k with k >= j.
 * Violators must release held resources and re-acquire in order (allocation released, request extended).
 */
export function applyResourceOrdering(s: Scenario): PreventionResult {
  let cur: Scenario = {
    allocation: clone(s.allocation),
    request: clone(s.request),
    available: [...s.available],
  };
  const affected: number[] = [];
  const notes: string[] = [];
  s.allocation.forEach((held, i) => {
    const highestHeld = held.reduce((h, x, j) => (x > 0 ? j : h), -1);
    const lowestReq = s.request[i].findIndex((x) => x > 0);
    if (lowestReq >= 0 && highestHeld >= lowestReq) {
      affected.push(i);
      notes.push(
        `P${i} holds R${highestHeld} but requests R${lowestReq} — violates ordering; releases holdings and re-requests in order.`,
      );
      const total = add(held, s.request[i]);
      cur = terminateProcess(cur, i);
      cur.request[i] = total;
    }
  });
  return { modified: cur, affected, notes };
}

/** Hold-and-wait prevention: a waiting process may not hold anything; it releases and requests all at once. */
export function applyHoldAndWait(s: Scenario): PreventionResult {
  let cur: Scenario = {
    allocation: clone(s.allocation),
    request: clone(s.request),
    available: [...s.available],
  };
  const affected: number[] = [];
  const notes: string[] = [];
  s.allocation.forEach((held, i) => {
    if (held.some((x) => x > 0) && s.request[i].some((x) => x > 0)) {
      affected.push(i);
      notes.push(
        `P${i} holds resources while waiting — releases them and requests [${add(held, s.request[i]).join(", ")}] atomically.`,
      );
      const total = add(held, s.request[i]);
      cur = terminateProcess(cur, i);
      cur.request[i] = total;
    }
  });
  return { modified: cur, affected, notes };
}
