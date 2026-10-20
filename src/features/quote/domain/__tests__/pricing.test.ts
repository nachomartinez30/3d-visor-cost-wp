import { describe, expect, it } from 'vitest';
import { estimatePrice } from '../pricing';
import { cube50, standardOptions, testConfig, withMetrics } from './fixtures';

describe('estimatePrice', () => {
  it('computes weight from shell + infill volume times density', () => {
    // shell = 15000 mm² * 1 mm = 15000 mm³; infill = (125000 - 15000) * 20 % = 22000 mm³
    // material = 37000 mm³ = 37 cm³ * 1.25 g/cm³ = 46.25 g
    const estimate = estimatePrice(cube50, standardOptions, testConfig);
    expect(estimate.materialVolumeMm3).toBeCloseTo(37_000);
    expect(estimate.weightGrams).toBeCloseTo(46.25);
  });

  it('caps the shell at the model volume for thin parts', () => {
    const thin = withMetrics({ volumeMm3: 1000, surfaceAreaMm2: 5000 });
    const estimate = estimatePrice(thin, standardOptions, testConfig);
    expect(estimate.materialVolumeMm3).toBeCloseTo(1000);
  });

  it('weighs more with higher infill', () => {
    const light = estimatePrice(cube50, { ...standardOptions, infillPercent: 10 }, testConfig);
    const solid = estimatePrice(cube50, { ...standardOptions, infillPercent: 100 }, testConfig);
    expect(solid.weightGrams).toBeGreaterThan(light.weightGrams);
    expect(solid.materialVolumeMm3).toBeCloseTo(125_000);
  });

  it('estimates print time from extruded volume and layer height', () => {
    // 37000 mm³ / 10 mm³/s = 3700 s at 0.2 mm
    const standard = estimatePrice(cube50, standardOptions, testConfig);
    expect(standard.printTimeHours).toBeCloseTo(3700 / 3600);
    // twice the layer height => twice the throughput => half the time
    const draft = estimatePrice(cube50, { ...standardOptions, layerHeightId: 'draft' }, testConfig);
    expect(draft.printTimeHours).toBeCloseTo(1850 / 3600);
  });

  it('adds per-layer overhead based on the part height', () => {
    const config = { ...testConfig, pricing: { ...testConfig.pricing, layerOverheadSeconds: 2 } };
    const estimate = estimatePrice(cube50, standardOptions, config);
    // 50 mm / 0.2 mm = 250 layers * 2 s = 500 s
    expect(estimate.printTimeHours).toBeCloseTo((3700 + 500) / 3600);
  });

  it('slows down for materials with a lower speed factor', () => {
    const tpu = estimatePrice(cube50, { ...standardOptions, materialId: 'tpu' }, testConfig);
    expect(tpu.printTimeHours).toBeCloseTo(7400 / 3600);
  });

  it('builds a breakdown of material, machine, setup and margin', () => {
    const { breakdown, total } = estimatePrice(cube50, standardOptions, testConfig);
    // material: 46.25 g * 20 /kg = 0.925 ; machine: 1.0278 h * 10 = 10.278 ; setup 5
    expect(breakdown.material).toBeCloseTo(0.93, 2);
    expect(breakdown.machine).toBeCloseTo(10.28, 2);
    expect(breakdown.setup).toBe(5);
    // margin 50 % of 16.20
    expect(breakdown.margin).toBeCloseTo(8.1, 1);
    expect(breakdown.minimumOrderAdjustment).toBe(0);
    expect(total).toBeCloseTo(24.31, 1);
    expect(total).toBeCloseTo(
      breakdown.material + breakdown.machine + breakdown.setup + breakdown.margin,
      2,
    );
  });

  it('raises the total to the minimum order when the part is very cheap', () => {
    const tiny = withMetrics({ volumeMm3: 1000, surfaceAreaMm2: 600, dimensionsMm: { x: 10, y: 10, z: 10 } });
    const { total, breakdown } = estimatePrice(tiny, standardOptions, testConfig);
    expect(total).toBe(15);
    expect(breakdown.minimumOrderAdjustment).toBeGreaterThan(0);
  });

  it('returns the configured currency', () => {
    expect(estimatePrice(cube50, standardOptions, testConfig).currency).toBe('USD');
  });

  it('throws for an unknown material or layer height', () => {
    expect(() => estimatePrice(cube50, { ...standardOptions, materialId: 'gold' }, testConfig)).toThrow();
    expect(() => estimatePrice(cube50, { ...standardOptions, layerHeightId: 'x' }, testConfig)).toThrow();
  });
});
