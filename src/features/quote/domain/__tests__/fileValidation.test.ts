import { describe, expect, it } from 'vitest';
import { validateModelFile, fileExtension } from '../fileValidation';
import { testConfig } from './fixtures';

const limits = testConfig.upload;

describe('validateModelFile', () => {
  it('extracts the lower-case extension', () => {
    expect(fileExtension('Part.Final.STL')).toBe('stl');
    expect(fileExtension('noext')).toBe('');
  });

  it('accepts supported formats within the size limit', () => {
    expect(validateModelFile({ name: 'part.3mf', size: 10 }, limits)).toBeNull();
  });

  it('rejects unsupported extensions', () => {
    expect(validateModelFile({ name: 'part.step', size: 10 }, limits)).toEqual({
      code: 'UNSUPPORTED_FORMAT',
      params: { extension: 'step', accepted: 'stl, obj, 3mf' },
    });
  });

  it('rejects empty and oversized files', () => {
    expect(validateModelFile({ name: 'a.stl', size: 0 }, limits)?.code).toBe('EMPTY_FILE');
    expect(validateModelFile({ name: 'a.stl', size: 1001 }, limits)).toEqual({
      code: 'FILE_TOO_LARGE',
      params: { sizeBytes: 1001, maxBytes: 1000 },
    });
  });
});
