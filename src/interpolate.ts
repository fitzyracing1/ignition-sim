/**
 * Linear interpolation helpers for the demo RPM advance table.
 */

/**
 * Piecewise-linear interpolate `ys` against sorted ascending `xs`.
 * Clamps to the first/last `ys` outside the domain.
 */
export function lerpTable(
  xs: readonly number[],
  ys: readonly number[],
  x: number,
): number {
  if (xs.length === 0 || ys.length === 0) {
    throw new Error("lerpTable: empty table");
  }
  if (xs.length !== ys.length) {
    throw new Error("lerpTable: xs and ys length mismatch");
  }

  if (x <= xs[0]!) return ys[0]!;
  if (x >= xs[xs.length - 1]!) return ys[ys.length - 1]!;

  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[i]!;
    const x1 = xs[i + 1]!;
    if (x >= x0 && x <= x1) {
      const t = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
      return ys[i]! + t * (ys[i + 1]! - ys[i]!);
    }
  }

  return ys[ys.length - 1]!;
}

/** Clamp `value` into [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
