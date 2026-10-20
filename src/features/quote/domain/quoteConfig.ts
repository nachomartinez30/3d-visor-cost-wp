export type PrintProcess = 'fdm' | 'resin';

export interface ColorConfig {
  readonly id: string;
  /** Display color used by the 3D viewer. */
  readonly hex: string;
}

export interface MaterialConfig {
  readonly id: string;
  /** Short technical label (not translated), e.g. "PLA". */
  readonly label: string;
  readonly process: PrintProcess;
  readonly densityGPerCm3: number;
  readonly pricePerKg: number;
  /** Multiplier on volumetric print speed (1 = reference, <1 = slower). */
  readonly speedFactor: number;
  readonly colors: readonly ColorConfig[];
}

export interface LayerHeightConfig {
  readonly id: string;
  readonly layerHeightMm: number;
}

export interface PricingConfig {
  /** ISO 4217 code, formatted with Intl in the UI. */
  readonly currency: string;
  readonly machineHourlyRate: number;
  readonly setupFee: number;
  readonly minimumOrder: number;
  /** 0.25 = 25 % margin on top of costs. */
  readonly marginRate: number;
  /** Approximate wall + top/bottom skin thickness printed solid. */
  readonly shellThicknessMm: number;
  readonly referenceLayerHeightMm: number;
  /** Extruded volume per second at the reference layer height. */
  readonly volumetricRateMm3PerSecond: number;
  /** Fixed time per layer (travel, layer change). */
  readonly layerOverheadSeconds: number;
}

export interface TriageThresholds {
  readonly overhangAngleDeg: number;
  readonly maxOverhangAreaRatio: number;
  readonly maxUnsupportedOverhangAreaMm2: number;
  readonly buildVolumeMm: { readonly x: number; readonly y: number; readonly z: number };
  readonly minDimensionMm: number;
  readonly maxTriangleCount: number;
  /** Surface area / volume (1/mm). High values mean thin walls or fine detail. */
  readonly maxSurfaceToVolumeRatio: number;
  readonly maxOpenEdges: number;
  readonly maxAutoPrice: number;
  readonly maxPrintHours: number;
}

export interface UploadLimits {
  readonly acceptedExtensions: readonly string[];
  readonly maxFileSizeBytes: number;
}

export interface QuoteConfig {
  readonly materials: readonly MaterialConfig[];
  readonly infillPercentOptions: readonly number[];
  readonly layerHeights: readonly LayerHeightConfig[];
  readonly pricing: PricingConfig;
  readonly triage: TriageThresholds;
  readonly upload: UploadLimits;
  readonly defaults: {
    readonly materialId: string;
    readonly infillPercent: number;
    readonly layerHeightId: string;
  };
}
