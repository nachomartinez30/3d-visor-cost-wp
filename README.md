# Layerform 3D — 3D printing quoter (frontend)

A single-page site for a 3D printing shop with an in-browser quoter. Simple parts get an
**estimated price** instantly. Parts with "excess" (supports, floating islands, fine detail,
oversized…) are **never auto-priced**: they go to **manual quote**, and the customer leaves
contact details.

> Known limitation: prices are **browser estimates** from a simple geometric model.
> There is no backend or slicer yet. Both are behind ports, so they can be swapped in later.

## Quick path

```bash
npm install
cp .env.example .env        # optional: set VITE_QUOTE_ENDPOINT
npm run dev                 # http://localhost:5173
npm run test -- --run       # unit + component tests
npm run build               # tsc (strict) + vite build
```

Try the sample files in `public/samples/` (also linked in the quote section):
`cube-30mm.stl` → AUTO, `t-shape-overhang.stl` and `floating-island.stl` → REVIEW.

## Where to change things

| I want to change… | Edit |
|---|---|
| Colors, fonts, radii, spacing (light/dark) | `src/branding/tokens.css` |
| Company name, contact email/phone | `src/branding/brand.ts` |
| Logo | `src/branding/Logo.tsx` (inline SVG), `public/favicon.svg` |
| Materials, colors, prices, infill, layer heights, thresholds, upload limits | `src/features/quote/config/quote.mock.ts` (the **only** pricing file) |
| Company sections data (services, stats, steps, testimonials) | `src/features/company/data/company.mock.ts` |
| Images and photo credits | `src/features/company/data/images.ts` |
| Any visible text | `src/i18n/locales/<lang>/*.json` |
| Manual-quote endpoint | `VITE_QUOTE_ENDPOINT` in `.env` |

## Structure

Screaming + hexagonal architecture. The domain is pure TypeScript (no React, no three.js, no i18n).

```
src/
  app/            App shell, nav, global CSS, composition root (wires ports to adapters)
  branding/       tokens.css, brand.ts, Logo.tsx
  i18n/           i18next setup, Intl formatters, language switcher, locales/<lang>/*.json
  features/
    company/      data/ (mock data, images) + ui/ (hero, services, about, process, testimonials, footer)
    quote/
      domain/          types, pricing engine, triage policy, quote decision, validation
      application/     ports + use cases: analyzeModel, estimateQuote, submitManualQuote
      infrastructure/  three.js loaders, geometry analyzer (BVH), local estimator,
                       HTTP/mock gateways, 3D viewer
      config/          quote.mock.ts
      ui/              containers + presentational components
  test/           test setup and render helper
```

Ports (in `application/ports.ts`): `ModelLoader`, `GeometryAnalyzer`, `QuoteEstimator`,
`ManualQuoteGateway`. To plug in a real slicer or backend, write a new adapter and swap it
in `src/app/compositionRoot.ts`.

## How the estimate works

| Step | Rule |
|---|---|
| Material volume | shell = min(volume, surface area × `shellThicknessMm`); plus (volume − shell) × infill % |
| Weight | material volume (cm³) × density (g/cm³) |
| Print time | material volume ÷ (`volumetricRateMm3PerSecond` × layer height / reference layer × material speed factor) + layers × `layerOverheadSeconds` |
| Price | material + machine hours × rate + setup fee, then margin, then raised to the minimum order |

## Triage (AUTO / REVIEW)

`domain/triage.ts` checks every rule and returns **all** triggered reasons as codes
(`{ code, measured, limit }`). Any reason ⇒ `REVIEW`. The UI translates the codes.

| Code | Triggers when (thresholds in `quote.mock.ts → triage`) |
|---|---|
| `FLOATING_ISLANDS` | any shell not resting on the plate or on another grounded shell — **always** REVIEW |
| `SUPPORTS_REQUIRED` | overhang area / surface area > `maxOverhangAreaRatio` |
| `UNSUPPORTED_OVERHANG` | overhang area over empty space > `maxUnsupportedOverhangAreaMm2` |
| `OVERSIZED` / `TOO_SMALL` | bounding box outside `buildVolumeMm` / below `minDimensionMm` |
| `FINE_DETAIL` | surface / volume > `maxSurfaceToVolumeRatio` |
| `HIGH_COMPLEXITY` | triangles > `maxTriangleCount` |
| `NON_MANIFOLD` / `INVALID_VOLUME` | open edges > `maxOpenEdges` / volume ≤ 0 |
| `HIGH_PRICE` / `LONG_PRINT` | estimate > `maxAutoPrice` / hours > `maxPrintHours` |

Hard rule: a `REVIEW` decision has **no price field** at all (`ReviewQuote` type), so the UI
cannot show one. Every decision carries an `audit` record (metrics, options, thresholds,
reasons, timestamp).

Geometry analysis (`infrastructure/analysis/analyzeGeometry.ts`, Z = up):
- Volume by signed tetrahedra; area, bounding box, open edges after welding vertices.
- Overhang = down-facing faces steeper than `overhangAngleDeg` (default 45°), not on the plate.
- Each overhang face is sampled and a ray is cast straight down with `three-mesh-bvh`:
  touching another shell ⇒ internal contact (ignored); nothing hit ⇒ overhang over empty space.
- Islands = connected shells that neither touch the plate nor rest on a grounded shell.

## Manual-quote request (payload contract)

`POST` to `VITE_QUOTE_ENDPOINT` as `multipart/form-data`. If the variable is empty, a mock
gateway waits ~1 s, logs the payload to the console, and returns a fake reference.

| Field | Type | Content |
|---|---|---|
| `file` | binary | the uploaded model (original file name) |
| `name` | string | required |
| `email` | string | required |
| `phone` | string | required |
| `notes` | string | optional, may be empty |
| `options` | JSON | `{ materialId, colorId, infillPercent, layerHeightId }` |
| `metrics` | JSON | `GeometryMetrics` (mm, mm², mm³, counts) |
| `triageStatus` | string | `"REVIEW"` |
| `triageReasons` | JSON | `[{ code, measured, limit }]` |
| `evaluatedAt` | string | ISO-8601 time of the triage decision |

Response: any 2xx is success. An optional JSON body `{ "referenceId": "..." }` is shown to
the user. Non-2xx ⇒ "server rejected" error; no answer within `VITE_QUOTE_TIMEOUT_MS`
(default 20 000 ms) ⇒ timeout error (request aborted); fetch failure ⇒ network error.

## Internationalization

- i18next + react-i18next. Spanish (`es`) is the default and fallback; English (`en`) is included.
- Namespaces: `common`, `company`, `quote`. The domain returns codes; the UI translates them.
- Language order: saved choice (localStorage, `layerform.language`) → `?lng=en` in the URL →
  `<html lang="es">`. The browser language is ignored on purpose so Spanish stays the default;
  add `'navigator'` to `detection.order` in `src/i18n/i18n.ts` to change that.
- `<html lang>` follows the active language. Numbers and money use `Intl` with the active
  locale; the currency comes from `quote.mock.ts → pricing.currency`.

### How to add a language

1. Copy `src/i18n/locales/es/` to `src/i18n/locales/<code>/` (e.g. `pt`).
2. Translate the three JSON files. Set `language.name` in `common.json` (e.g. "Português").
3. Done: the folder is picked up automatically and appears in the switcher.
   `npm run test -- --run` fails if any key from `es` is missing or extra.

## Image credits

Photos from [Unsplash](https://unsplash.com) (Unsplash License), hot-linked from `images.unsplash.com`:

- [Jakub Żerdzicki — 3D printer with orange accents](https://unsplash.com/photos/gJ8bkUlUFkY)
- [Minku Kang — row of 3D printers](https://unsplash.com/photos/aCniNTiIFd8)
- [Jakub Żerdzicki — printer with yellow filament](https://unsplash.com/photos/W_SYA5yU9p8)

## Known limitations

- Prices and times are estimates; no slicer, no real support material or travel moves.
- Units are assumed to be millimetres; models are not auto-oriented (OBJ files exported Y-up will be analyzed as-is).
- Analysis runs on the main thread; very large meshes may freeze the page briefly (a Web Worker adapter can implement the same port).
- Ray-based checks are sampled (up to ~20 000 rays), so areas are approximate.
- Brand, company data, materials and prices are placeholders.
