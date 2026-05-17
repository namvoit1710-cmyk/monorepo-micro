import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatDuration, formatLogTime, getExecutionDuration } from "./workflow-log-utils";

describe("execution-log-utils", () => {

  describe("getExecutionDuration", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("returns elapsed ms from log.timestamp to now", () => {
      vi.setSystemTime(10_000);
      expect(getExecutionDuration({ timestamp: 8_000 } as any)).toBe(2_000);
    });

    it("returns 0 when timestamp equals current time", () => {
      vi.setSystemTime(5_000);
      expect(getExecutionDuration({ timestamp: 5_000 } as any)).toBe(0);
    });
  });

  describe("formatDuration", () => {
    describe("< 1 second — shows raw ms", () => {
      it.each([
        [0, "0ms"],
        [1, "1ms"],
        [500, "500ms"],
        [999, "999ms"],
      ])("formatDuration(%i) → %s", (ms, expected) => {
        expect(formatDuration(ms)).toBe(expected);
      });
    });

    describe("1s to < 1 minute — shows decimal seconds", () => {
      it.each([
        [1_000, "1.0s"],
        [1_500, "1.5s"],
        [2_000, "2.0s"],
        [59_900, "59.9s"],
        [59_999, "60.0s"],
      ])("formatDuration(%i) → %s", (ms, expected) => {
        expect(formatDuration(ms)).toBe(expected);
      });
    });

    describe("1 minute to < 1 hour — shows min and seconds", () => {
      it.each([
        [60_000, "1m 0s"],
        [61_000, "1m 1s"],
        [65_000, "1m 5s"],
        [3_540_000, "59m 0s"],
        [3_599_000, "59m 59s"],
      ])("formatDuration(%i) → %s", (ms, expected) => {
        expect(formatDuration(ms)).toBe(expected);
      });
    });

    describe("1 hour to < 1 day — shows hours and minutes", () => {
      it.each([
        [3_600_000, "1h 0m"],
        [3_660_000, "1h 1m"],
        [7_200_000, "2h 0m"],
        [86_340_000, "23h 59m"],
      ])("formatDuration(%i) → %s", (ms, expected) => {
        expect(formatDuration(ms)).toBe(expected);
      });
    });

    describe(">= 1 day — shows days and hours", () => {
      it.each([
        [86_400_000, "1d 0h"],
        [90_000_000, "1d 1h"],
        [172_800_000, "2d 0h"],
        [180_000_000, "2d 2h"],
      ])("formatDuration(%i) → %s", (ms, expected) => {
        expect(formatDuration(ms)).toBe(expected);
      });
    });

    describe("boundary values at each threshold", () => {
      it("999ms is last value shown as ms", () => {
        expect(formatDuration(999)).toBe("999ms");
      });

      it("1000ms is first value shown as seconds", () => {
        expect(formatDuration(1_000)).toBe("1.0s");
      });

      it("60000ms is first value shown as minutes", () => {
        expect(formatDuration(60_000)).toBe("1m 0s");
      });

      it("3600000ms is first value shown as hours", () => {
        expect(formatDuration(3_600_000)).toBe("1h 0m");
      });

      it("86400000ms is first value shown as days", () => {
        expect(formatDuration(86_400_000)).toBe("1d 0h");
      });
    });
  });

  describe("formatLogTime", () => {
    it("outputs two-digit padded HH:mm:ss format", () => {
      const result = formatLogTime(new Date(2024, 0, 1, 9, 5, 3).getTime());
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it("includes all three time components", () => {
      const result = formatLogTime(new Date(2024, 0, 1, 14, 30, 45).getTime());
      const parts = result.split(":");
      expect(parts).toHaveLength(3);
      parts.forEach((p) => expect(p).toMatch(/^\d{2}$/));
    });
  });
});
