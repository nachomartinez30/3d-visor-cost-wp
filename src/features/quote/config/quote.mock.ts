import type { QuoteConfig } from '../domain/quoteConfig';

/**
 * MOCK QUOTE CONFIGURATION — the single place to edit prices, materials and rules.
 *
 * Every value here is a placeholder until the client confirms real printers,
 * materials and prices. Material and color NAMES live in the translation files
 * (src/i18n/locales/<lang>/quote.json -> options.materials / options.colors),
 * keyed by the ids below.
 */
export const quoteConfig: QuoteConfig = {
  materials: [
    {
      id: 'pla',
      label: 'PLA',
      process: 'fdm',
      densityGPerCm3: 1.24,
      pricePerKg: 25,
      speedFactor: 1,
      colors: [
        { id: 'white', hex: '#f4f4f2' },
        { id: 'black', hex: '#2b2b2b' },
        { id: 'orange', hex: '#f77f00' },
        { id: 'blue', hex: '#2f6fde' },
        { id: 'red', hex: '#d62839' },
        { id: 'green', hex: '#3a9d5d' },
      ],
    },
    {
      id: 'petg',
      label: 'PETG',
      process: 'fdm',
      densityGPerCm3: 1.27,
      pricePerKg: 30,
      speedFactor: 0.9,
      colors: [
        { id: 'clear', hex: '#cfe8ef' },
        { id: 'black', hex: '#2b2b2b' },
        { id: 'white', hex: '#f4f4f2' },
        { id: 'blue', hex: '#2f6fde' },
      ],
    },
    {
      id: 'abs',
      label: 'ABS',
      process: 'fdm',
      densityGPerCm3: 1.04,
      pricePerKg: 28,
      speedFactor: 0.9,
      colors: [
        { id: 'black', hex: '#2b2b2b' },
        { id: 'white', hex: '#f4f4f2' },
        { id: 'grey', hex: '#8d99ae' },
      ],
    },
    {
      id: 'tpu',
      label: 'TPU 95A',
      process: 'fdm',
      densityGPerCm3: 1.21,
      pricePerKg: 45,
      speedFactor: 0.45,
      colors: [
        { id: 'black', hex: '#2b2b2b' },
        { id: 'red', hex: '#d62839' },
      ],
    },
    {
      id: 'resin',
      label: 'Resin',
      process: 'resin',
      densityGPerCm3: 1.15,
      pricePerKg: 70,
      speedFactor: 0.7,
      colors: [
        { id: 'grey', hex: '#8d99ae' },
        { id: 'clear', hex: '#cfe8ef' },
        { id: 'black', hex: '#2b2b2b' },
      ],
    },
  ],
  infillPercentOptions: [10, 20, 40, 60, 100],
  layerHeights: [
    { id: 'draft', layerHeightMm: 0.28 },
    { id: 'standard', layerHeightMm: 0.2 },
    { id: 'fine', layerHeightMm: 0.12 },
  ],
  pricing: {
    currency: 'USD',
    machineHourlyRate: 3.5,
    setupFee: 4,
    minimumOrder: 10,
    marginRate: 0.3,
    shellThicknessMm: 1.2,
    referenceLayerHeightMm: 0.2,
    volumetricRateMm3PerSecond: 8,
    layerOverheadSeconds: 1.5,
  },
  triage: {
    overhangAngleDeg: 45,
    maxOverhangAreaRatio: 0.05,
    maxUnsupportedOverhangAreaMm2: 25,
    buildVolumeMm: { x: 250, y: 210, z: 220 },
    minDimensionMm: 2,
    maxTriangleCount: 1_000_000,
    maxSurfaceToVolumeRatio: 1.5,
    maxOpenEdges: 0,
    maxAutoPrice: 400,
    maxPrintHours: 36,
  },
  upload: {
    acceptedExtensions: ['stl', 'obj', '3mf'],
    maxFileSizeBytes: 50 * 1024 * 1024,
  },
  defaults: { materialId: 'pla', infillPercent: 20, layerHeightId: 'standard' },
};
