import { describe, expect, it } from "vitest";
import {
  assertValidInput,
  computeAdvanceDeg,
  computeDwellMs,
  computeIgnition,
} from "../src/compute.js";
import { DEFAULT_CONFIG } from "../src/config.js";

describe("assertValidInput", () => {
  it("accepts normal idle and cruise points", () => {
    expect(() => assertValidInput({ rpm: 800, load: 0.2 })).not.toThrow();
    expect(() => assertValidInput({ rpm: 3000, load: 0.5 })).not.toThrow();
  });

  it("rejects non-finite and out-of-range values", () => {
    expect(() => assertValidInput({ rpm: NaN, load: 0.5 })).toThrow(TypeError);
    expect(() => assertValidInput({ rpm: -1, load: 0.5 })).toThrow(RangeError);
    expect(() => assertValidInput({ rpm: 25_000, load: 0.5 })).toThrow(RangeError);
    expect(() => assertValidInput({ rpm: 1000, load: -0.1 })).toThrow(RangeError);
    expect(() => assertValidInput({ rpm: 1000, load: 1.1 })).toThrow(RangeError);
    expect(() => assertValidInput({ rpm: 1000, load: Infinity })).toThrow(TypeError);
  });
});

describe("computeAdvanceDeg", () => {
  it("returns base-ish advance near idle with mid load", () => {
    // At 800 rpm, rpm adder ≈ 0; load 0.5 → correction 0 → ~base (10°)
    const adv = computeAdvanceDeg(800, 0.5);
    expect(adv).toBeCloseTo(DEFAULT_CONFIG.baseAdvanceDeg, 5);
  });

  it("advances more at mid RPM than at idle (same load)", () => {
    const idle = computeAdvanceDeg(800, 0.5);
    const mid = computeAdvanceDeg(4000, 0.5);
    expect(mid).toBeGreaterThan(idle);
  });

  it("gives more advance at light load than at heavy load", () => {
    const light = computeAdvanceDeg(2500, 0.0);
    const heavy = computeAdvanceDeg(2500, 1.0);
    expect(light).toBeGreaterThan(heavy);
    // Difference should be about loadGain (8°) at extremes around 0.5
    expect(light - heavy).toBeCloseTo(DEFAULT_CONFIG.loadGainDeg, 5);
  });

  it("clamps to min/max advance", () => {
    // Force extreme via custom config
    const cfg = {
      ...DEFAULT_CONFIG,
      baseAdvanceDeg: -50,
      rpmAdvanceAddersDeg: DEFAULT_CONFIG.rpmAdvanceAddersDeg.map(() => 0),
      loadGainDeg: 0,
      minAdvanceDeg: 0,
      maxAdvanceDeg: 40,
    };
    expect(computeAdvanceDeg(1000, 0.5, cfg)).toBe(0);

    const hot = {
      ...cfg,
      baseAdvanceDeg: 100,
    };
    expect(computeAdvanceDeg(1000, 0.5, hot)).toBe(40);
  });

  it("handles load extremes 0 and 1 without throwing", () => {
    expect(() => computeAdvanceDeg(2000, 0)).not.toThrow();
    expect(() => computeAdvanceDeg(2000, 1)).not.toThrow();
  });
});

describe("computeDwellMs", () => {
  it("shortens dwell as RPM rises", () => {
    const idle = computeDwellMs(800);
    const high = computeDwellMs(6000);
    expect(high).toBeLessThan(idle);
  });

  it("respects dwell clamps at very low and very high RPM", () => {
    // Near-zero RPM → hits max dwell
    expect(computeDwellMs(1)).toBe(DEFAULT_CONFIG.maxDwellMs);
    // Very high RPM → hits min dwell
    expect(computeDwellMs(15_000)).toBe(DEFAULT_CONFIG.minDwellMs);
  });

  it("at reference RPM is near dwellAtRefMs (within clamps)", () => {
    const d = computeDwellMs(DEFAULT_CONFIG.dwellRefRpm);
    expect(d).toBeCloseTo(DEFAULT_CONFIG.dwellAtRefMs, 5);
  });
});

describe("computeIgnition", () => {
  it("returns dwell, advance, and spark duration for a cruise point", () => {
    const result = computeIgnition({ rpm: 2500, load: 0.4 });
    expect(result.dwellMs).toBeGreaterThan(0);
    expect(result.advanceDeg).toBeGreaterThan(0);
    expect(result.sparkDurationMs).toBe(DEFAULT_CONFIG.sparkDurationMs);
  });

  it("covers idle edge case", () => {
    const idle = computeIgnition({ rpm: 700, load: 0.15 });
    expect(idle.dwellMs).toBeGreaterThanOrEqual(DEFAULT_CONFIG.minDwellMs);
    expect(idle.dwellMs).toBeLessThanOrEqual(DEFAULT_CONFIG.maxDwellMs);
    expect(idle.advanceDeg).toBeGreaterThanOrEqual(DEFAULT_CONFIG.minAdvanceDeg);
    expect(idle.advanceDeg).toBeLessThanOrEqual(DEFAULT_CONFIG.maxAdvanceDeg);
  });

  it("covers high-RPM edge case", () => {
    const high = computeIgnition({ rpm: 7000, load: 0.9 });
    expect(high.dwellMs).toBeLessThan(computeDwellMs(1000));
    expect(high.advanceDeg).toBeGreaterThanOrEqual(DEFAULT_CONFIG.minAdvanceDeg);
    expect(high.advanceDeg).toBeLessThanOrEqual(DEFAULT_CONFIG.maxAdvanceDeg);
  });

  it("covers load extremes at fixed RPM", () => {
    const light = computeIgnition({ rpm: 3000, load: 0 });
    const heavy = computeIgnition({ rpm: 3000, load: 1 });
    expect(light.advanceDeg).toBeGreaterThan(heavy.advanceDeg);
    expect(light.dwellMs).toBe(heavy.dwellMs); // dwell independent of load
  });

  it("throws on invalid input rather than inventing numbers", () => {
    expect(() => computeIgnition({ rpm: -100, load: 0.5 })).toThrow();
    expect(() => computeIgnition({ rpm: 2000, load: 2 })).toThrow();
  });
});
