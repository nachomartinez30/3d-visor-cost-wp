import type { BufferGeometry } from 'three';
import type { ModelLoader } from '../../application/ports';
import { fileExtension } from '../../domain/fileValidation';

const FORMATS = ['stl', 'obj', '3mf'] as const;
type Format = (typeof FORMATS)[number];
const isFormat = (value: string): value is Format => (FORMATS as readonly string[]).includes(value);

/**
 * Loads STL / OBJ / 3MF files with the three.js example loaders.
 * three.js is imported lazily so it does not weigh on the first page load.
 */
export const threeModelLoader: ModelLoader<BufferGeometry> = {
  load: async (file) => {
    const format = fileExtension(file.name);
    if (!isFormat(format)) throw new Error('UNSUPPORTED_FORMAT');
    const [data, { parseModel }, { normalizeGeometry }] = await Promise.all([
      file.arrayBuffer(),
      import('./parseModel'),
      import('./normalizeGeometry'),
    ]);
    return normalizeGeometry(parseModel(format, data));
  },
};
