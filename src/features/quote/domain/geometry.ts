/** Axis-aligned size in millimetres. Z is the build (vertical) direction. */
export interface Dimensions {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * Metrics extracted from a mesh by a GeometryAnalyzer.
 * All lengths in mm, areas in mm², volumes in mm³. Z is "up" (build direction).
 */
export interface GeometryMetrics {
  readonly volumeMm3: number;
  readonly surfaceAreaMm2: number;
  readonly dimensionsMm: Dimensions;
  readonly triangleCount: number;
  /** Angle from vertical beyond which a down-facing face counts as overhang. */
  readonly overhangAngleDeg: number;
  /** Area of down-facing faces steeper than the overhang angle, excluding faces resting on the plate. */
  readonly overhangAreaMm2: number;
  /** overhangAreaMm2 / surfaceAreaMm2 (0..1). */
  readonly overhangAreaRatio: number;
  /** Overhang area whose downward ray hits nothing (support must reach the build plate). */
  readonly unsupportedOverhangAreaMm2: number;
  /** Disconnected mesh parts whose lowest point is above the build plate. */
  readonly islandCount: number;
  /** Edges not shared by exactly two triangles (0 for a watertight mesh). */
  readonly openEdgeCount: number;
}
