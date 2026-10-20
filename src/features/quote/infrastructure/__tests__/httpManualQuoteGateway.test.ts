import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildManualQuoteFormData, createHttpManualQuoteGateway } from '../gateway/httpManualQuoteGateway';
import { ManualQuoteSubmissionError, type ManualQuoteRequest } from '../../application/ports';
import { cube50, standardOptions } from '../../domain/__tests__/fixtures';

const request: ManualQuoteRequest = {
  file: new File(['solid part'], 'part.stl', { type: 'model/stl' }),
  contact: { name: 'Ada', email: 'ada@example.com', phone: '+1 555 123 4567', notes: 'Rush please' },
  options: standardOptions,
  metrics: cube50,
  triage: {
    status: 'REVIEW',
    reasons: [{ code: 'FLOATING_ISLANDS', measured: 1, limit: 0 }],
    evaluatedAt: '2026-01-01T00:00:00.000Z',
  },
};

const okResponse = (body: unknown = { referenceId: 'Q-42' }) =>
  new Response(JSON.stringify(body), { status: 201, headers: { 'Content-Type': 'application/json' } });

afterEach(() => vi.useRealTimers());

describe('buildManualQuoteFormData', () => {
  it('contains the file, contact fields and JSON fields', () => {
    const form = buildManualQuoteFormData(request);
    const file = form.get('file') as File;
    expect(file.name).toBe('part.stl');
    expect(form.get('name')).toBe('Ada');
    expect(form.get('email')).toBe('ada@example.com');
    expect(form.get('phone')).toBe('+1 555 123 4567');
    expect(form.get('notes')).toBe('Rush please');
    expect(JSON.parse(form.get('options') as string)).toEqual(standardOptions);
    expect(JSON.parse(form.get('metrics') as string)).toEqual(cube50);
    expect(JSON.parse(form.get('triageReasons') as string)).toEqual(request.triage.reasons);
    expect(form.get('triageStatus')).toBe('REVIEW');
    expect(form.get('evaluatedAt')).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('HttpManualQuoteGateway', () => {
  it('POSTs multipart form data to the endpoint and returns the reference', async () => {
    const fetchFn = vi.fn(async () => okResponse());
    const gateway = createHttpManualQuoteGateway({ endpoint: 'https://api.test/quotes', fetchFn });
    await expect(gateway.submit(request)).resolves.toEqual({ referenceId: 'Q-42' });
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.test/quotes');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect(init.headers).toEqual({ Accept: 'application/json' });
  });

  it('accepts empty or non-JSON success bodies', async () => {
    const fetchFn = vi.fn(async () => new Response(null, { status: 204 }));
    const gateway = createHttpManualQuoteGateway({ endpoint: '/q', fetchFn });
    await expect(gateway.submit(request)).resolves.toEqual({});
  });

  it('throws an HTTP error for non-2xx responses', async () => {
    const fetchFn = vi.fn(async () => new Response('nope', { status: 500 }));
    const gateway = createHttpManualQuoteGateway({ endpoint: '/q', fetchFn });
    await expect(gateway.submit(request)).rejects.toMatchObject({ kind: 'HTTP', status: 500 });
  });

  it('aborts and throws TIMEOUT when the server is too slow', async () => {
    vi.useFakeTimers();
    const fetchFn = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        }),
    );
    const gateway = createHttpManualQuoteGateway({ endpoint: '/q', fetchFn, timeoutMs: 1000 });
    const pending = gateway.submit(request);
    const assertion = expect(pending).rejects.toEqual(new ManualQuoteSubmissionError('TIMEOUT'));
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });

  it('throws NETWORK when fetch fails', async () => {
    const fetchFn = vi.fn(async () => Promise.reject(new TypeError('Failed to fetch')));
    const gateway = createHttpManualQuoteGateway({ endpoint: '/q', fetchFn });
    await expect(gateway.submit(request)).rejects.toMatchObject({ kind: 'NETWORK' });
  });
});
