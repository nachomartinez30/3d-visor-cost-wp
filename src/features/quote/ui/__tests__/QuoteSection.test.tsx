import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BufferGeometry } from 'three';
import { QuoteSection } from '../QuoteSection';
import type { QuoteDependencies } from '../QuoteDependencies';
import type { ManualQuoteGateway } from '../../application/ports';
import type { GeometryMetrics } from '../../domain/geometry';
import { createLocalQuoteEstimator } from '../../infrastructure/estimation/localQuoteEstimator';
import { cube50, testConfig, withMetrics } from '../../domain/__tests__/fixtures';
import { renderWithI18n } from '../../../../test/renderWithI18n';

// jsdom has no WebGL: replace the three.js canvas.
vi.mock('../../infrastructure/viewer/ModelViewer', () => ({
  default: () => <div data-testid="model-viewer" />,
}));

const makeDeps = (metrics: GeometryMetrics, gateway?: ManualQuoteGateway): QuoteDependencies => ({
  config: testConfig,
  loader: { load: async () => new BufferGeometry() },
  analyzer: { analyze: async () => metrics },
  estimator: createLocalQuoteEstimator(testConfig),
  gateway: gateway ?? { submit: vi.fn(async () => ({ referenceId: 'Q-7' })) },
});

const stl = () => new File([new Uint8Array(100)], 'part.stl');
const upload = async (file: File) => {
  const user = userEvent.setup({ applyAccept: false });
  await user.upload(screen.getByLabelText(/choose file|replace file/i), file);
  return user;
};

describe('QuoteSection', () => {
  it('rejects files with an unsupported extension', async () => {
    const deps = makeDeps(cube50);
    const loadSpy = vi.spyOn(deps.loader, 'load');
    renderWithI18n(<QuoteSection deps={deps} />);
    await upload(new File(['x'], 'part.step'));
    expect(await screen.findByRole('alert')).toHaveTextContent('The ".step" format is not supported');
    expect(loadSpy).not.toHaveBeenCalled();
  });

  it('shows the automatic price and breakdown for a clean part', async () => {
    renderWithI18n(<QuoteSection deps={makeDeps(cube50)} />);
    await upload(stl());
    expect(await screen.findByTestId('quote-total')).toHaveTextContent('$');
    expect(screen.getByRole('table', { name: 'Price breakdown' })).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: /manual quote/i })).not.toBeInTheDocument();
  });

  it('recomputes the price live when options change', async () => {
    renderWithI18n(<QuoteSection deps={makeDeps(cube50)} />);
    const user = await upload(stl());
    const before = (await screen.findByTestId('quote-total')).textContent;
    await user.selectOptions(screen.getByLabelText('Infill'), '100');
    await waitFor(() => expect(screen.getByTestId('quote-total').textContent).not.toBe(before));
  });

  it('sends parts with islands to manual review: reasons + form, never a price', async () => {
    renderWithI18n(<QuoteSection deps={makeDeps(withMetrics({ islandCount: 2 }))} />);
    await upload(stl());
    const review = await screen.findByRole('region', { name: 'This part needs a review' });
    expect(within(review).getByText(/Floating parts: 2 region/)).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Request a manual quote' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Phone/)).toBeInTheDocument();
    expect(screen.queryByTestId('quote-total')).not.toBeInTheDocument();
  });

  it('validates the manual quote form and submits it through the gateway', async () => {
    const gateway: ManualQuoteGateway = { submit: vi.fn(async () => ({ referenceId: 'Q-7' })) };
    renderWithI18n(<QuoteSection deps={makeDeps(withMetrics({ overhangAreaRatio: 0.4 }), gateway)} />);
    const user = await upload(stl());
    await screen.findByRole('form', { name: 'Request a manual quote' });

    await user.click(screen.getByRole('button', { name: 'Send request' }));
    expect(screen.getAllByText('This field is required.')).toHaveLength(3);
    expect(screen.getByLabelText(/^Name/)).toHaveFocus();
    expect(screen.getByLabelText(/^Name/)).toHaveAttribute('aria-invalid', 'true');

    await user.type(screen.getByLabelText(/^Name/), 'Ada');
    await user.type(screen.getByLabelText(/^Email/), 'ada@example');
    await user.type(screen.getByLabelText(/^Phone/), '+1 555 123 4567');
    await user.click(screen.getByRole('button', { name: 'Send request' }));
    expect(screen.getByText(/Enter a valid email/)).toBeInTheDocument();
    expect(gateway.submit).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/^Email/), '.com');
    await user.click(screen.getByRole('button', { name: 'Send request' }));
    expect(await screen.findByText('Request sent!')).toBeInTheDocument();
    expect(screen.getByText('Reference number: Q-7')).toBeInTheDocument();
    expect(gateway.submit).toHaveBeenCalledTimes(1);
  });

  it('shows an error state when the submission fails', async () => {
    const gateway: ManualQuoteGateway = { submit: async () => Promise.reject(new TypeError('offline')) };
    renderWithI18n(<QuoteSection deps={makeDeps(withMetrics({ islandCount: 1 }), gateway)} />);
    const user = await upload(stl());
    await screen.findByRole('form', { name: 'Request a manual quote' });
    await user.type(screen.getByLabelText(/^Name/), 'Ada');
    await user.type(screen.getByLabelText(/^Email/), 'ada@example.com');
    await user.type(screen.getByLabelText(/^Phone/), '1155551234');
    await user.click(screen.getByRole('button', { name: 'Send request' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('We could not connect');
  });

  it('renders in Spanish by default', async () => {
    renderWithI18n(<QuoteSection deps={makeDeps(cube50)} />, 'es');
    expect(screen.getByRole('heading', { name: 'Cotiza tu pieza en segundos' })).toBeInTheDocument();
  });
});
