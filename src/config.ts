import type { IgnitionConfig } from "./types.js";

/**
 * Default demo calibration — simple published-style curves, NOT proprietary
 * OEM / Ford / any manufacturer maps.
 *
 * Advance: starts near idle base, climbs with RPM, plateaus mid-range.
 * Load: light load advances; heavy load retards (knock-avoidance demo).
 * Dwell: shortens as RPM rises so coil charge fits in available time.
 */
export const DEFAULT_CONFIG: IgnitionConfig = {
  baseAdvanceDeg: 10,

  // Roughly: idle → cruise → mid → "power" plateau
  rpmBreakpoints: [800, 1500, 2500, 4000, 5500, 7000],
  rpmAdvanceAddersDeg: [0, 8, 16, 22, 24, 22],

  loadGainDeg: 8,

  minAdvanceDeg: 0,
  maxAdvanceDeg: 40,

  dwellRefRpm: 1000,
  dwellAtRefMs: 3.5,
  dwellExponent: 0.55,
  minDwellMs: 1.2,
  maxDwellMs: 4.5,

  sparkDurationMs: 1.0,
};
