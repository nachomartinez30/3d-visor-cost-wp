import { useId, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { ManualQuoteGateway, SubmissionFailure } from '../application/ports';
import { submitManualQuote } from '../application/submitManualQuote';
import {
  MAX_NOTES_LENGTH,
  validateContact,
  type ContactDetails,
  type ContactErrors,
} from '../domain/contactValidation';
import type { ReviewQuote } from '../domain/quoteDecision';

interface ManualQuoteFormProps {
  readonly file: File;
  readonly decision: ReviewQuote;
  readonly gateway: ManualQuoteGateway;
}

type SubmitState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'submitting' }
  | { readonly kind: 'success'; readonly referenceId?: string }
  | { readonly kind: 'error'; readonly failure: SubmissionFailure };

const FIELDS = ['name', 'email', 'phone', 'notes'] as const;
type Field = (typeof FIELDS)[number];
const REQUIRED: readonly Field[] = ['name', 'email', 'phone'];

export function ManualQuoteForm({ file, decision, gateway }: ManualQuoteFormProps) {
  const { t } = useTranslation('quote');
  const formId = useId();
  const refs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const [values, setValues] = useState<ContactDetails>({ name: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });

  const visibleError = (field: Field) => (touched[field] ? errors[field] : undefined);

  const update = (field: Field, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) setErrors(validateContact(next));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const allTouched = Object.fromEntries(FIELDS.map((f) => [f, true]));
    setTouched(allTouched);
    const found = validateContact(values);
    setErrors(found);
    const firstInvalid = FIELDS.find((f) => found[f]);
    if (firstInvalid) {
      refs.current[firstInvalid]?.focus();
      return;
    }
    setState({ kind: 'submitting' });
    const result = await submitManualQuote({ file, contact: values, decision }, gateway);
    if (result.ok) setState({ kind: 'success', referenceId: result.receipt.referenceId });
    else if (result.reason === 'FAILED') setState({ kind: 'error', failure: result.failure });
    else {
      setErrors(result.errors);
      setState({ kind: 'idle' });
    }
  };

  if (state.kind === 'success') {
    return (
      <div className="notice notice--success" role="status">
        <h4>{t('form.successTitle')}</h4>
        <p>{t('form.successBody')}</p>
        {state.referenceId && <p>{t('form.reference', { id: state.referenceId })}</p>}
      </div>
    );
  }

  const submitting = state.kind === 'submitting';
  const field = (name: Field, type: string, autoComplete: string) => {
    const id = `${formId}-${name}`;
    const error = visibleError(name);
    const required = REQUIRED.includes(name);
    const common = {
      id,
      name,
      value: values[name],
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${id}-error` : undefined,
      'aria-required': required || undefined,
      onBlur: () => {
        setTouched((current) => ({ ...current, [name]: true }));
        setErrors(validateContact(values));
      },
    };
    return (
      <div className="field">
        <label htmlFor={id}>
          {t(`form.fields.${name}`)}
          {required ? (
            <span className="required" aria-hidden="true">
              {' '}
              *
            </span>
          ) : (
            <span className="muted"> {t('form.optional')}</span>
          )}
        </label>
        {name === 'notes' ? (
          <textarea
            {...common}
            ref={(el) => {
              refs.current[name] = el;
            }}
            rows={4}
            maxLength={MAX_NOTES_LENGTH}
            placeholder={t('form.placeholders.notes')}
            onChange={(e) => update(name, e.target.value)}
          />
        ) : (
          <input
            {...common}
            ref={(el) => {
              refs.current[name] = el;
            }}
            type={type}
            autoComplete={autoComplete}
            placeholder={t(`form.placeholders.${name}`)}
            onChange={(e) => update(name, e.target.value)}
          />
        )}
        {error && (
          <p id={`${id}-error`} className="field-error">
            {t(`form.errors.${error}`, { max: MAX_NOTES_LENGTH })}
          </p>
        )}
      </div>
    );
  };

  return (
    <form className="manual-form" noValidate onSubmit={(e) => void onSubmit(e)} aria-labelledby={`${formId}-title`}>
      <h4 id={`${formId}-title`}>{t('form.title')}</h4>
      <p className="muted">{t('form.requiredHint')}</p>
      <div className="manual-form__grid">
        {field('name', 'text', 'name')}
        {field('email', 'email', 'email')}
        {field('phone', 'tel', 'tel')}
      </div>
      {field('notes', 'text', 'off')}
      {state.kind === 'error' && (
        <p className="notice notice--error" role="alert">
          {t(`form.failures.${state.failure}`)}
        </p>
      )}
      <button className="button button--primary" type="submit" disabled={submitting}>
        {submitting ? t('form.submitting') : t('form.submit')}
      </button>
    </form>
  );
}
