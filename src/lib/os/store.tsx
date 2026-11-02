import { createContext, useContext, useState, type ReactNode } from "react";
import { SAMPLE, SAMPLE_REQUEST } from "./testCases";
import { clone, zeros, type Matrix, type Vec } from "./algorithms";

export interface Activity {
  time: string;
  text: string;
  tone: "ok" | "warn" | "err" | "info";
}

interface Store {
  allocation: Matrix;
  max: Matrix;
  available: Vec;
  request: Matrix;
  setAllocation: (m: Matrix) => void;
  setMax: (m: Matrix) => void;
  setAvailable: (v: Vec) => void;
  setRequest: (m: Matrix) => void;
  resize: (n: number, m: number) => void;
  loadSample: () => void;
  reset: () => void;
  activity: Activity[];
  log: (text: string, tone?: Activity["tone"]) => void;
}

const Ctx = createContext<Store | null>(null);

const fit = (mat: Matrix, n: number, m: number) =>
  Array.from({ length: n }, (_, i) => Array.from({ length: m }, (_, j) => mat[i]?.[j] ?? 0));

export function OSProvider({ children }: { children: ReactNode }) {
  const [allocation, setAllocation] = useState<Matrix>(clone(SAMPLE.allocation));
  const [max, setMax] = useState<Matrix>(clone(SAMPLE.max));
  const [available, setAvailable] = useState<Vec>([...SAMPLE.available]);
  const [request, setRequest] = useState<Matrix>(clone(SAMPLE_REQUEST));
  const [activity, setActivity] = useState<Activity[]>([]);
  const log = (text: string, tone: Activity["tone"] = "info") =>
    setActivity((a) => [{ time: new Date().toLocaleTimeString(), text, tone }, ...a].slice(0, 20));

  const store: Store = {
    allocation,
    max,
    available,
    request,
    setAllocation,
    setMax,
    setAvailable,
    setRequest,
    activity,
    log,
    resize: (n, m) => {
      setAllocation(fit(allocation, n, m));
      setMax(fit(max, n, m));
      setRequest(fit(request, n, m));
      setAvailable(Array.from({ length: m }, (_, j) => available[j] ?? 0));
    },
    loadSample: () => {
      setAllocation(clone(SAMPLE.allocation));
      setMax(clone(SAMPLE.max));
      setAvailable([...SAMPLE.available]);
      setRequest(clone(SAMPLE_REQUEST));
      log("Loaded sample data (5 processes, 3 resource types)");
    },
    reset: () => {
      const n = allocation.length,
        m = available.length;
      setAllocation(zeros(n, m));
      setMax(zeros(n, m));
      setRequest(zeros(n, m));
      setAvailable(Array(m).fill(0));
      log("Inputs reset to zero");
    },
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useOS() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useOS must be inside OSProvider");
  return s;
}
