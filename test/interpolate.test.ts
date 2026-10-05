import { describe, expect, it } from "vitest";
import { clamp, lerpTable } from "../src/interpolate.js";

describe("lerpTable", () => {
  const xs = [0, 10, 20];
  const ys = [0, 100, 200];

  it("returns endpoints when x is outside the domain", () => {
    expect(lerpTable(xs, ys, -5)).toBe(0);
    expect(lerpTable(xs, ys, 25)).toBe(200);
  });

  it("returns exact breakpoint values", () => {
    expect(lerpTable(xs, ys, 0)).toBe(0);
    expect(lerpTable(xs, ys, 10)).toBe(100);
    expect(lerpTable(xs, ys, 20)).toBe(200);
  });

  it("interpolates midway between breakpoints", () => {
    expect(lerpTable(xs, ys, 5)).toBe(50);
    expect(lerpTable(xs, ys, 15)).toBe(150);
  });

  it("throws on empty or mismatched tables", () => {
    expect(() => lerpTable([], [], 1)).toThrow(/empty/);
    expect(() => lerpTable([1], [1, 2], 1)).toThrow(/mismatch/);
  });
});

describe("clamp", () => {
  it("clamps below, inside, and above", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});
