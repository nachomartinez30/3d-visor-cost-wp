import type { GeometryMetrics } from './geometry';
import type { TriageThresholds } from './quoteConfig';

export type TriageStatus = 'AUTO' | 'REVIEW';

/** Machine-readable reasons. The UI translates them; the domain never holds copy. */
export type TriageReasonCode =
  | 'FLOATING_ISLANDS'
  | 'SUPPORTS_REQUIRED'
  | 'UNSUPPORTED_OVERHANG'
  | 'OVERSIZED'
  | 'TOO_SMALL'
  | 'FINE_DETAIL'
  | 'HIGH_COMPLEXITY'
  | 'NON_MANIFOLD'
  | 'INVALID_VOLUME'
  | 'HIGH_PRICE'
  | 'LONG_PRINT';

export interface TriageReason {
  readonly code: TriageReasonCode;
  /** The measured value that crossed the limit. */
  readonly measured: number;
  readonly limit: number;
}

export interface TriageResult {
  readonly status: TriageStatus;
  readonly reasons: readonly TriageReason[];
}

/** Only the parts of a price estimate the policy needs. */
export interface TriageEstimateInput {
  readonly total: number;
  readonly printTimeHours: number;
}

/**
 * Decides whether a part can be priced automatically.
 * Any triggered rule sends the part to manual review; floating islands always do,
 * whatever the thresholds are.
 */
export const evaluateTriage = (
  metrics: GeometryMetrics,
  estimate: TriageEstimateInput,
  thresholds: TriageThresholds,
): TriageResult => {
  const reasons: TriageReason[] = [];
  const add = (code: TriageReasonCode, measured: number, limit: number) =>
    reasons.push({ code, measured, limit });
  const dims = metrics.dimensionsMm;
  const build = thresholds.buildVolumeMm;

  if (metrics.islandCount > 0) add('FLOATING_ISLANDS', metrics.islandCount, 0);
  if (metrics.overhangAreaRatio > thresholds.maxOverhangAreaRatio) {
    add('SUPPORTS_REQUIRED', metrics.overhangAreaRatio, thresholds.maxOverhangAreaRatio);
  }
  if (metrics.unsupportedOverhangAreaMm2 > thresholds.maxUnsupportedOverhangAreaMm2) {
    add('UNSUPPORTED_OVERHANG', metrics.unsupportedOverhangAreaMm2, thresholds.maxUnsupportedOverhangAreaMm2);
  }
  const largestExcess = Math.max(dims.x - build.x, dims.y - build.y, dims.z - build.z);
  if (largestExcess > 0) {
    add('OVERSIZED', Math.max(dims.x, dims.y, dims.z), Math.min(build.x, build.y, build.z));
  }
  const smallest = Math.min(dims.x, dims.y, dims.z);
  if (smallest < thresholds.minDimensionMm) add('TOO_SMALL', smallest, thresholds.minDimensionMm);
  if (metrics.volumeMm3 > 0) {
    const ratio = metrics.surfaceAreaMm2 / metrics.volumeMm3;
    if (ratio > thresholds.maxSurfaceToVolumeRatio) add('FINE_DETAIL', ratio, thresholds.maxSurfaceToVolumeRatio);
  }
  if (metrics.triangleCount > thresholds.maxTriangleCount) {
    add('HIGH_COMPLEXITY', metrics.triangleCount, thresholds.maxTriangleCount);
  }
  if (metrics.openEdgeCount > thresholds.maxOpenEdges) {
    add('NON_MANIFOLD', metrics.openEdgeCount, thresholds.maxOpenEdges);
  }
  if (!(metrics.volumeMm3 > 0)) add('INVALID_VOLUME', metrics.volumeMm3, 0);
  if (estimate.total > thresholds.maxAutoPrice) add('HIGH_PRICE', estimate.total, thresholds.maxAutoPrice);
  if (estimate.printTimeHours > thresholds.maxPrintHours) {
    add('LONG_PRINT', estimate.printTimeHours, thresholds.maxPrintHours);
  }

  return { status: reasons.length === 0 ? 'AUTO' : 'REVIEW', reasons };
};
