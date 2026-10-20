import { useTranslation } from 'react-i18next';
import { useFormatters } from '../../../i18n/format';
import type { AnalyzeError } from '../application/analyzeModel';
import { QuoteInstructions } from './QuoteInstructions';
import { FileDropzone } from './FileDropzone';
import { OptionsPanel } from './OptionsPanel';
import { QuoteResult } from './QuoteResult';
import { ReviewPanel } from './ReviewPanel';
import { ViewerPanel } from './ViewerPanel';
import type { QuoteDependencies } from './QuoteDependencies';
import { useQuoteFlow } from './useQuoteFlow';

/** Container for the whole quote flow. Presentational pieces get plain props. */
export function QuoteSection({ deps }: { readonly deps: QuoteDependencies }) {
  const { t } = useTranslation('quote');
  const format = useFormatters();
  const { config } = deps;
  const flow = useQuoteFlow(deps);
  const material = config.materials.find((m) => m.id === flow.options.materialId);
  const color = material?.colors.find((c) => c.id === flow.options.colorId)?.hex ?? '#cccccc';

  const errorMessage = (error: AnalyzeError | null) => {
    if (!error) return undefined;
    if (error.code === 'FILE_TOO_LARGE') {
      return t('upload.errors.FILE_TOO_LARGE', {
        size: format.bytesAsMb(Number(error.params.sizeBytes)),
        max: format.bytesAsMb(Number(error.params.maxBytes)),
      });
    }
    return t(`upload.errors.${error.code}`, error.params);
  };

  return (
    <section className="section quote" id="quote" aria-labelledby="quote-title">
      <div className="container">
        <p className="eyebrow">{t('section.eyebrow')}</p>
        <h2 id="quote-title">{t('section.title')}</h2>
        <p className="lead">{t('section.lead')}</p>
        <QuoteInstructions config={config} />

        <div className="quote__workspace">
          <div className="quote__left">
            <FileDropzone
              acceptedExtensions={config.upload.acceptedExtensions}
              maxSizeLabel={t('upload.maxSize', { max: format.bytesAsMb(config.upload.maxFileSizeBytes) })}
              busy={flow.status === 'analyzing'}
              fileName={flow.model?.file.name}
              errorMessage={errorMessage(flow.error)}
              onFile={(file) => void flow.selectFile(file)}
            />
            <ViewerPanel
              geometry={flow.model?.geometry ?? null}
              color={color}
              overhangAngleDeg={config.triage.overhangAngleDeg}
              buildVolumeMm={config.triage.buildVolumeMm}
            />
          </div>
          <div className="quote__right">
            <OptionsPanel config={config} options={flow.options} onChange={flow.updateOptions} />
            {flow.model && flow.decision?.status === 'AUTO' && (
              <QuoteResult decision={flow.decision} metrics={flow.model.metrics} />
            )}
            {flow.model && flow.decision?.status === 'REVIEW' && (
              <ReviewPanel
                decision={flow.decision}
                file={flow.model.file}
                currency={config.pricing.currency}
                gateway={deps.gateway}
              />
            )}
            {!flow.model && <p className="result result--empty">{t('results.empty')}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
