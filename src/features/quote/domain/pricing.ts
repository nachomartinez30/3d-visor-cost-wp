import type { GeometryMetrics } from './geometry';
import { roundMoney } from './money';
import type { LayerHeightConfig, MaterialConfig, QuoteConfig } from './quoteConfig';
import type { QuoteOptions } from './quoteOptions';

export interface PriceBreakdown {
  readonly material: number;
  readonly machine: number;
  readonly setup: number;
  readonly margin: number;
  /** Extra amount added so the total reaches the minimum order. */
  readonly minimumOrderAdjustment: number;
}

export interface PriceEstimate {
  readonly currency: string;
  /** Plastic actually deposited: solid shell + partial infill. */
  readonly materialVolumeMm3: number;
  readonly weightGrams: number;
  readonly printTimeHours: number;
  readonly breakdown: PriceBreakdown;
  readonly total: number;
}

export const findMaterial = (config: QuoteConfig, id: string): MaterialConfig => {
  const material = config.materials.find((m) => m.id === id);
  if (!material) throw new Error(`Unknown material "${id}"`);
  return material;
};

export const findLayerHeight = (config: QuoteConfig, id: string): LayerHeightConfig => {
  const layer = config.layerHeights.find((l) => l.id === id);
  if (!layer) throw new Error(`Unknown layer height "${id}"`);
  return layer;
};

/**
 * Browser-side price estimate.
 *
 * - Weight: the outer shell (surface area × shell thickness, capped at the volume)
 *   is solid; the rest of the volume is filled at the infill percentage.
 * - Time: extruded volume / volumetric rate, where the rate scales with the layer
 *   height and the material speed factor, plus a fixed overhead per layer.
 * - Price: material + machine time + setup, plus margin, raised to the minimum order.
 */
export const estimatePrice = (
  metrics: GeometryMetrics,
  options: QuoteOptions,
  config: QuoteConfig,
): PriceEstimate => {
  const material = findMaterial(config, options.materialId);
  const layer = findLayerHeight(config, options.layerHeightId);
  const pricing = config.pricing;

  const volume = Math.max(0, metrics.volumeMm3);
  const shellVolume = Math.min(volume, metrics.surfaceAreaMm2 * pricing.shellThicknessMm);
  const infillVolume = (volume - shellVolume) * (options.infillPercent / 100);
  const materialVolumeMm3 = shellVolume + infillVolume;
  const weightGrams = (materialVolumeMm3 / 1000) * material.densityGPerCm3;

  const rate =
    pricing.volumetricRateMm3PerSecond *
    (layer.layerHeightMm / pricing.referenceLayerHeightMm) *
    material.speedFactor;
  const layerCount = Math.ceil(metrics.dimensionsMm.z / layer.layerHeightMm);
  const printSeconds = materialVolumeMm3 / rate + layerCount * pricing.layerOverheadSeconds;
  const printTimeHours = printSeconds / 3600;

  const materialCost = roundMoney((weightGrams / 1000) * material.pricePerKg);
  const machineCost = roundMoney(printTimeHours * pricing.machineHourlyRate);
  const setup = roundMoney(pricing.setupFee);
  const margin = roundMoney((materialCost + machineCost + setup) * pricing.marginRate);
  const beforeMinimum = roundMoney(materialCost + machineCost + setup + margin);
  const minimumOrderAdjustment = roundMoney(Math.max(0, pricing.minimumOrder - beforeMinimum));

  return {
    currency: pricing.currency,
    materialVolumeMm3,
    weightGrams,
    printTimeHours,
    breakdown: { material: materialCost, machine: machineCost, setup, margin, minimumOrderAdjustment },
    total: roundMoney(beforeMinimum + minimumOrderAdjustment),
  };
};
