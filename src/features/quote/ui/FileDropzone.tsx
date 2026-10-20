import { useId, useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface FileDropzoneProps {
  readonly acceptedExtensions: readonly string[];
  readonly maxSizeLabel: string;
  readonly busy: boolean;
  readonly fileName?: string;
  readonly errorMessage?: string;
  readonly onFile: (file: File) => void;
}

export function FileDropzone({ acceptedExtensions, maxSizeLabel, busy, fileName, errorMessage, onFile }: FileDropzoneProps) {
  const { t } = useTranslation('quote');
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const accept = acceptedExtensions.map((ext) => `.${ext}`).join(',');

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && !busy) onFile(file);
  };

  return (
    <div
      className={`dropzone${dragging ? ' dropzone--active' : ''}${errorMessage ? ' dropzone--error' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      aria-busy={busy}
    >
      <svg className="dropzone__icon" width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="dropzone__title">{busy ? t('upload.analyzing') : t('upload.dragHere')}</p>
      <input
        ref={inputRef}
        id={inputId}
        className="visually-hidden"
        type="file"
        accept={accept}
        disabled={busy}
        aria-describedby={`${hintId}${errorMessage ? ` ${errorId}` : ''}`}
        aria-invalid={errorMessage ? true : undefined}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = '';
        }}
      />
      <label htmlFor={inputId} className={`button button--secondary${busy ? ' is-disabled' : ''}`}>
        {fileName ? t('upload.replace') : t('upload.choose')}
      </label>
      <p id={hintId} className="dropzone__hint">
        {t('upload.hint', { formats: acceptedExtensions.map((e) => e.toUpperCase()).join(', '), max: maxSizeLabel })}
      </p>
      {fileName && !busy && <p className="dropzone__file">{t('upload.selected', { name: fileName })}</p>}
      {errorMessage && (
        <p id={errorId} className="field-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
