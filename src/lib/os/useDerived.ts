import { useMemo } from "react";
import { useOS } from "./store";
import { bankersSafety, computeNeed, validateState } from "./algorithms";

export function useDerived() {
  const os = useOS();
  return useMemo(() => {
    const state = { allocation: os.allocation, max: os.max, available: os.available };
    const errors = validateState(state);
    const need = computeNeed(os.max, os.allocation);
    const safety = errors.length ? null : bankersSafety(os.available, os.allocation, need);
    return { state, errors, need, safety };
  }, [os.allocation, os.max, os.available]);
}
