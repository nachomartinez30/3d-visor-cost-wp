import { describe, expect, it, vi } from 'vitest';
import { analyzeModel } from '../analyzeModel';
import type { GeometryAnalyzer, ModelLoader } from '../ports';
import { cube50, testConfig } from '../../domain/__tests__/fixtures';

const file = (name: string, size = 10) => new File([new Uint8Array(size)], name);
const loader = (): ModelLoader<string> => ({ load: vi.fn(async () => 'model') });
const analyzer = (): GeometryAnalyzer<string> => ({ analyze: vi.fn(async () => cube50) });

describe('analyzeModel', () => {
  it('loads and analyzes a valid file with the configured overhang angle', async () => {
    const deps = { loader: loader(), analyzer: analyzer(), config: testConfig };
    const result = await analyzeModel(file('part.stl'), deps);
    expect(result).toEqual({ ok: true, model: 'model', metrics: cube50 });
    expect(deps.analyzer.analyze).toHaveBeenCalledWith('model', { overhangAngleDeg: 45 });
  });

  it('rejects invalid files before loading them', async () => {
    const deps = { loader: loader(), analyzer: analyzer(), config: testConfig };
    const result = await analyzeModel(file('part.step'), deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('UNSUPPORTED_FORMAT');
    expect(deps.loader.load).not.toHaveBeenCalled();
  });

  it('reports parse failures as PARSE_FAILED', async () => {
    const failing: ModelLoader<string> = { load: async () => Promise.reject(new Error('boom')) };
    const result = await analyzeModel(file('part.obj'), { loader: failing, analyzer: analyzer(), config: testConfig });
    expect(result).toEqual({ ok: false, error: { code: 'PARSE_FAILED', params: {} } });
  });
});
