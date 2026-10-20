import { describe, expect, it } from 'vitest';
import { parseModel } from '../loaders/parseModel';
import { normalizeGeometry } from '../loaders/normalizeGeometry';
import { box } from './shapes';

const asciiStl = `solid tri
facet normal 0 0 1
 outer loop
  vertex 10 10 5
  vertex 20 10 5
  vertex 10 20 7
 endloop
endfacet
endsolid tri`;

const obj = `v 0 0 0
v 4 0 0
v 0 4 0
v 0 0 4
f 1 3 2
f 1 2 4
f 1 4 3
f 2 3 4`;

const toBuffer = (text: string) => new TextEncoder().encode(text).buffer as ArrayBuffer;

describe('normalizeGeometry', () => {
  it('centers the model on X/Y and rests it on the plate (z = 0)', () => {
    const geometry = normalizeGeometry(box([100, 50, 10], [120, 60, 30]));
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox!;
    expect(bounds.min.z).toBeCloseTo(0);
    expect((bounds.min.x + bounds.max.x) / 2).toBeCloseTo(0);
    expect((bounds.min.y + bounds.max.y) / 2).toBeCloseTo(0);
    expect(geometry.getAttribute('normal')).toBeDefined();
  });
});

describe('parseModel', () => {
  it('parses an ASCII STL', () => {
    const geometry = parseModel('stl', toBuffer(asciiStl));
    expect(geometry.getAttribute('position').count).toBe(3);
  });

  it('parses an OBJ into a single geometry', () => {
    const geometry = parseModel('obj', toBuffer(obj));
    expect(geometry.getAttribute('position').count).toBe(12);
  });

  it('rejects files without triangles', () => {
    expect(() => parseModel('obj', toBuffer('# empty'))).toThrow('NO_GEOMETRY');
  });
});
