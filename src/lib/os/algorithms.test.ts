import { describe, it, expect } from "vitest";
import { runTestCases } from "./testCases";
import { detectDeadlock, bankersSafety } from "./algorithms";

describe("OS algorithms", () => {
  for (const tc of runTestCases()) {
    it(`${tc.id} ${tc.title}`, () => {
      expect(tc.pass, `${tc.actual} vs ${tc.expected}`).toBe(true);
    });
  }
  it("unsafe is not deadlock", () => {
    // unsafe by Banker's (needs exceed) yet no current requests => no deadlock
    const s = bankersSafety([0], [[1], [1]], [[2], [2]]);
    expect(s.safe).toBe(false);
    expect(detectDeadlock([0], [[1], [1]], [[0], [0]]).deadlocked).toEqual([]);
  });
});
