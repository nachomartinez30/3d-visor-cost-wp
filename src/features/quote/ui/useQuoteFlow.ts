import { useCallback, useEffect, useState } from 'react';
import type { BufferGeometry } from 'three';
import { analyzeModel, type AnalyzeError } from '../application/analyzeModel';
import { estimateQuote } from '../application/estimateQuote';
import { validateModelFile } from '../domain/fileValidation';
import type { GeometryMetrics } from '../domain/geometry';
import type { QuoteConfig } from '../domain/quoteConfig';
import type { QuoteDecision } from '../domain/quoteDecision';
import type { QuoteOptions } from '../domain/quoteOptions';
import type { QuoteDependencies } from './QuoteDependencies';

export type FlowStatus = 'idle' | 'analyzing' | 'ready' | 'error';

export interface LoadedModel {
  readonly file: File;
  readonly geometry: BufferGeometry;
  readonly metrics: GeometryMetrics;
}

export const defaultOptions = (config: QuoteConfig): QuoteOptions => {
  const material = config.materials.find((m) => m.id === config.defaults.materialId) ?? config.materials[0]!;
  return {
    materialId: material.id,
    colorId: material.colors[0]?.id ?? '',
    infillPercent: config.defaults.infillPercent,
    layerHeightId: config.defaults.layerHeightId,
  };
};

/** Container logic: upload -> analysis -> live estimate whenever options change. */
export const useQuoteFlow = (deps: QuoteDependencies) => {
  const { config, loader, analyzer, estimator } = deps;
  const [status, setStatus] = useState<FlowStatus>('idle');
  const [error, setError] = useState<AnalyzeError | null>(null);
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [options, setOptions] = useState<QuoteOptions>(() => defaultOptions(config));
  const [decision, setDecision] = useState<QuoteDecision | null>(null);

  const selectFile = useCallback(
    async (file: File) => {
      const invalid = validateModelFile(file, config.upload);
      if (invalid) {
        setError(invalid);
        setStatus(model ? 'ready' : 'error');
        return;
      }
      setError(null);
      setStatus('analyzing');
      const result = await analyzeModel(file, { loader, analyzer, config });
      if (result.ok) {
        setModel({ file, geometry: result.model, metrics: result.metrics });
        setDecision(null);
        setStatus('ready');
      } else {
        setError(result.error);
        setStatus(model ? 'ready' : 'error');
      }
    },
    [analyzer, config, loader, model],
  );

  const updateOptions = useCallback(
    (patch: Partial<QuoteOptions>) =>
      setOptions((current) => {
        const next = { ...current, ...patch };
        const material = config.materials.find((m) => m.id === next.materialId);
        if (material && !material.colors.some((c) => c.id === next.colorId)) {
          next.colorId = material.colors[0]?.id ?? '';
        }
        return next;
      }),
    [config],
  );

  useEffect(() => {
    if (!model) return;
    let cancelled = false;
    void estimateQuote(estimator, model.metrics, options).then((result) => {
      if (!cancelled) setDecision(result);
    });
    return () => {
      cancelled = true;
    };
  }, [estimator, model, options]);

  const reset = useCallback(() => {
    setModel(null);
    setDecision(null);
    setError(null);
    setStatus('idle');
  }, []);

  return { status, error, model, options, decision, selectFile, updateOptions, reset };
};
