import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '../../../i18n/format';
import type { QuoteConfig } from '../domain/quoteConfig';
import type { QuoteOptions } from '../domain/quoteOptions';

interface OptionsPanelProps {
  readonly config: QuoteConfig;
  readonly options: QuoteOptions;
  readonly onChange: (patch: Partial<QuoteOptions>) => void;
}

export function OptionsPanel({ config, options, onChange }: OptionsPanelProps) {
  const { t } = useTranslation('quote');
  const format = useFormatters();
  const materialId = useId();
  const infillId = useId();
  const material = config.materials.find((m) => m.id === options.materialId);

  return (
    <form className="options" onSubmit={(event) => event.preventDefault()} aria-label={t('options.title')}>
      <h3>{t('options.title')}</h3>
      <div className="field">
        <label htmlFor={materialId}>{t('options.material')}</label>
        <select id={materialId} value={options.materialId} onChange={(e) => onChange({ materialId: e.target.value })}>
          {config.materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label} — {t(`options.materials.${m.id}`)}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="field">
        <legend>{t('options.color')}</legend>
        <div className="swatches">
          {material?.colors.map((color) => (
            <label key={color.id} className="swatch" title={t(`options.colors.${color.id}`)}>
              <input
                type="radio"
                name="color"
                value={color.id}
                checked={options.colorId === color.id}
                onChange={() => onChange({ colorId: color.id })}
              />
              <span className="swatch__dot" style={{ background: color.hex }} aria-hidden="true" />
              <span className="swatch__label">{t(`options.colors.${color.id}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor={infillId}>{t('options.infill')}</label>
        <select
          id={infillId}
          value={options.infillPercent}
          onChange={(e) => onChange({ infillPercent: Number(e.target.value) })}
        >
          {config.infillPercentOptions.map((percent) => (
            <option key={percent} value={percent}>
              {format.percent(percent / 100)} — {t(`options.infillLevels.${percent}`)}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="field">
        <legend>{t('options.resolution')}</legend>
        <div className="segmented">
          {config.layerHeights.map((layer) => (
            <label key={layer.id} className="segmented__option">
              <input
                type="radio"
                name="layerHeight"
                value={layer.id}
                checked={options.layerHeightId === layer.id}
                onChange={() => onChange({ layerHeightId: layer.id })}
              />
              <span>
                {t(`options.layerHeights.${layer.id}`)}
                <small>{t('options.layerHeightValue', { value: format.number(layer.layerHeightMm, 2) })}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </form>
  );
}
