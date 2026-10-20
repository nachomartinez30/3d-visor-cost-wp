import type { UploadLimits } from './quoteConfig';

export type FileErrorCode = 'UNSUPPORTED_FORMAT' | 'FILE_TOO_LARGE' | 'EMPTY_FILE';

export interface FileError {
  readonly code: FileErrorCode;
  readonly params: Readonly<Record<string, string | number>>;
}

export const fileExtension = (fileName: string): string => {
  const dot = fileName.lastIndexOf('.');
  return dot < 0 ? '' : fileName.slice(dot + 1).toLowerCase();
};

/** Validates name + size only, so it works with File objects or plain data. */
export const validateModelFile = (
  file: { readonly name: string; readonly size: number },
  limits: UploadLimits,
): FileError | null => {
  const extension = fileExtension(file.name);
  if (!limits.acceptedExtensions.includes(extension)) {
    return {
      code: 'UNSUPPORTED_FORMAT',
      params: { extension, accepted: limits.acceptedExtensions.join(', ') },
    };
  }
  if (file.size <= 0) return { code: 'EMPTY_FILE', params: {} };
  if (file.size > limits.maxFileSizeBytes) {
    return { code: 'FILE_TOO_LARGE', params: { sizeBytes: file.size, maxBytes: limits.maxFileSizeBytes } };
  }
  return null;
};
