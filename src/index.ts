/**
 * fakegreen01 (Ignition simulator) — pure software ignition-timing simulator.
 *
 * SAFETY: Educational / demo only. Do NOT use to control real engines,
 * vehicles, ECUs, ignition coils, or any hardware.
 */

export { computeIgnition, computeAdvanceDeg, computeDwellMs, assertValidInput } from "./compute.js";
export { DEFAULT_CONFIG } from "./config.js";
export { lerpTable, clamp } from "./interpolate.js";
export type { IgnitionInput, IgnitionResult, IgnitionConfig } from "./types.js";
