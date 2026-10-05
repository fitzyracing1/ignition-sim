/**
 * Input/output types for the ignition-timing simulator.
 *
 * This module is educational only. It does not talk to hardware,
 * ECUs, coils, or any vehicle systems.
 */

/** Engine operating point for a simulated ignition calculation. */
export interface IgnitionInput {
  /**
   * Engine speed in revolutions per minute.
   * Typical demo range: ~600 (idle) to ~7000 (redline-ish).
   */
  rpm: number;

  /**
   * Normalized load in [0, 1].
   * 0 = light / closed-throttle; 1 = full load (WOT / high MAP fraction).
   * Not a calibrated MAP sensor value — a simple fraction for demos.
   */
  load: number;
}

/** Result of a simulated ignition timing computation. */
export interface IgnitionResult {
  /** Coil dwell (charge) time in milliseconds. */
  dwellMs: number;

  /** Spark advance in degrees Before Top Dead Center (BTDC). */
  advanceDeg: number;

  /** Approximate spark-event duration in milliseconds (fixed demo value). */
  sparkDurationMs: number;
}

/** Tunable constants for the simple demo formulas (not OEM maps). */
export interface IgnitionConfig {
  /** Base advance at the reference condition (degrees BTDC). */
  baseAdvanceDeg: number;

  /** RPM breakpoints for the advance table (ascending). */
  rpmBreakpoints: readonly number[];

  /** Advance adders (degrees) matching rpmBreakpoints. */
  rpmAdvanceAddersDeg: readonly number[];

  /**
   * Load correction gain: advance += (0.5 - load) * loadGainDeg.
   * Light load increases advance; heavy load retards.
   */
  loadGainDeg: number;

  /** Minimum / maximum clamped advance (degrees BTDC). */
  minAdvanceDeg: number;
  maxAdvanceDeg: number;

  /** Reference RPM used in the dwell scaling formula. */
  dwellRefRpm: number;

  /** Dwell at dwellRefRpm (ms), before clamping. */
  dwellAtRefMs: number;

  /** Exponent k in dwell ∝ (refRpm / rpm)^k. */
  dwellExponent: number;

  /** Dwell clamps (ms). */
  minDwellMs: number;
  maxDwellMs: number;

  /** Fixed spark duration used for demos (ms). */
  sparkDurationMs: number;
}
