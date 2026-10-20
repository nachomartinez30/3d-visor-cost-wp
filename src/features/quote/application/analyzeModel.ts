import { validateModelFile, type FileError } from '../domain/fileValidation';
import type { GeometryMetrics } from '../domain/geometry';
import type { QuoteConfig } from '../domain/quoteConfig';
import type { GeometryAnalyzer, ModelLoader } from './ports';

export type AnalyzeError = FileError | { readonly code: 'PARSE_FAILED'; readonly params: Record<string, never> };

export type AnalyzeResult<TModel> =
  | { readonly ok: true; readonly model: TModel; readonly metrics: GeometryMetrics }
  | { readonly ok: false; readonly error: AnalyzeError };

export interface AnalyzeDeps<TModel> {
  readonly loader: ModelLoader<TModel>;
  readonly analyzer: GeometryAnalyzer<TModel>;
  readonly config: QuoteConfig;
}

/** Validate -> load -> analyze. Never throws: failures come back as error codes. */
export const analyzeModel = async <TModel>(file: File, deps: AnalyzeDeps<TModel>): Promise<AnalyzeResult<TModel>> => {
  const invalid = validateModelFile(file, deps.config.upload);
  if (invalid) return { ok: false, error: invalid };
  try {
    const model = await deps.loader.load(file);
    const metrics = await deps.analyzer.analyze(model, { overhangAngleDeg: deps.config.triage.overhangAngleDeg });
    return { ok: true, model, metrics };
  } catch {
    return { ok: false, error: { code: 'PARSE_FAILED', params: {} } };
  }
};
