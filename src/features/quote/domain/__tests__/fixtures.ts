import type { GeometryMetrics } from '../geometry';
import type { QuoteConfig } from '../quoteConfig';
import type { QuoteOptions } from '../quoteOptions';

/** Stable config for tests: independent of the editable mock config. */
export const testConfig: QuoteConfig = {
  materials: [
    {
      id: 'pla',
      label: 'PLA',
      process: 'fdm',
      densityGPerCm3: 1.25,
      pricePerKg: 20,
      speedFactor: 1,
      colors: [{ id: 'black', hex: '#111111' }],
    },
    {
      id: 'tpu',
      label: 'TPU',
      process: 'fdm',
      densityGPerCm3: 1.2,
      pricePerKg: 40,
      speedFactor: 0.5,
      colors: [{ id: 'black', hex: '#111111' }],
    },
  ],
  infillPercentOptions: [10, 20, 100],
  layerHeights: [
    { id: 'draft', layerHeightMm: 0.4 },
    { id: 'standard', layerHeightMm: 0.2 },
  ],
  pricing: {
    currency: 'USD',
    machineHourlyRate: 10,
    setupFee: 5,
    minimumOrder: 15,
    marginRate: 0.5,
    shellThicknessMm: 1,
    referenceLayerHeightMm: 0.2,
    volumetricRateMm3PerSecond: 10,
    layerOverheadSeconds: 0,
  },
  triage: {
    overhangAngleDeg: 45,
    maxOverhangAreaRatio: 0.05,
    maxUnsupportedOverhangAreaMm2: 100,
    buildVolumeMm: { x: 250, y: 210, z: 220 },
    minDimensionMm: 2,
    maxTriangleCount: 500_000,
    maxSurfaceToVolumeRatio: 2,
    maxOpenEdges: 0,
    maxAutoPrice: 500,
    maxPrintHours: 48,
  },
  upload: { acceptedExtensions: ['stl', 'obj', '3mf'], maxFileSizeBytes: 1000 },
  defaults: { materialId: 'pla', infillPercent: 20, layerHeightId: 'standard' },
};

/** A clean 50 mm cube resting on the plate. */
export const cube50: GeometryMetrics = {
  volumeMm3: 125_000,
  surfaceAreaMm2: 15_000,
  dimensionsMm: { x: 50, y: 50, z: 50 },
  triangleCount: 12,
  overhangAngleDeg: 45,
  overhangAreaMm2: 0,
  overhangAreaRatio: 0,
  unsupportedOverhangAreaMm2: 0,
  islandCount: 0,
  openEdgeCount: 0,
};

export const standardOptions: QuoteOptions = {
  materialId: 'pla',
  colorId: 'black',
  infillPercent: 20,
  layerHeightId: 'standard',
};

export const withMetrics = (overrides: Partial<GeometryMetrics>): GeometryMetrics => ({
  ...cube50,
  ...overrides,
});
