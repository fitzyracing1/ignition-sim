import { DEFAULT_CONFIG } from "./config.js";
import { clamp, lerpTable } from "./interpolate.js";
import type { IgnitionConfig, IgnitionInput, IgnitionResult } from "./types.js";

/**
 * Validate finite, in-range inputs. Throws on bad values so callers
 * cannot silently feed nonsense into the demo formulas.
 */
export function assertValidInput(input: IgnitionInput): void {
  const { rpm, load } = input;

  if (typeof rpm !== "number" || !Number.isFinite(rpm)) {
    throw new TypeError(`rpm must be a finite number, got ${String(rpm)}`);
  }
  if (rpm < 0) {
    throw new RangeError(`rpm must be >= 0, got ${rpm}`);
  }
  // Soft upper bound for the simulator (not a real redline).
  if (rpm > 20_000) {
    throw new RangeError(`rpm out of simulator range (>20000), got ${rpm}`);
  }

  if (typeof load !== "number" || !Number.isFinite(load)) {
    throw new TypeError(`load must be a finite number, got ${String(load)}`);
  }
  if (load < 0 || load > 1) {
    throw new RangeError(`load must be in [0, 1], got ${load}`);
  }
}

/**
 * Spark advance (degrees BTDC):
 *
 *   advance = base + RPM_table(rpm) + (0.5 - load) * loadGain
 *   advance = clamp(advance, minAdvance, maxAdvance)
 *
 * Light load (load → 0) adds advance; heavy load (load → 1) retards.
 */
export function computeAdvanceDeg(
  rpm: number,
  load: number,
  config: IgnitionConfig = DEFAULT_CONFIG,
): number {
  const rpmAdder = lerpTable(
    config.rpmBreakpoints,
    config.rpmAdvanceAddersDeg,
    rpm,
  );
  const loadCorrection = (0.5 - load) * config.loadGainDeg;
  const raw = config.baseAdvanceDeg + rpmAdder + loadCorrection;
  return clamp(raw, config.minAdvanceDeg, config.maxAdvanceDeg);
}

/**
 * Coil dwell (ms), battery voltage assumed constant:
 *
 *   dwell = dwellAtRef * (dwellRefRpm / max(rpm, 1))^dwellExponent
 *   dwell = clamp(dwell, minDwell, maxDwell)
 *
 * Higher RPM → less available time → shorter dwell (within clamps).
 */
export function computeDwellMs(
  rpm: number,
  config: IgnitionConfig = DEFAULT_CONFIG,
): number {
  const safeRpm = Math.max(rpm, 1);
  const ratio = config.dwellRefRpm / safeRpm;
  const raw = config.dwellAtRefMs * Math.pow(ratio, config.dwellExponent);
  return clamp(raw, config.minDwellMs, config.maxDwellMs);
}

/**
 * Main simulator entry point.
 *
 * @example
 * ```ts
 * import { computeIgnition } from "ignition-sim";
 * const { dwellMs, advanceDeg, sparkDurationMs } = computeIgnition({
 *   rpm: 2500,
 *   load: 0.4,
 * });
 * ```
 */
export function computeIgnition(
  input: IgnitionInput,
  config: IgnitionConfig = DEFAULT_CONFIG,
): IgnitionResult {
  assertValidInput(input);

  return {
    dwellMs: computeDwellMs(input.rpm, config),
    advanceDeg: computeAdvanceDeg(input.rpm, input.load, config),
    sparkDurationMs: config.sparkDurationMs,
  };
}
