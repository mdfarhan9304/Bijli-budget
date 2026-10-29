# BijliBudget — MVP

A browser-first electricity bill review and savings planner built with Next.js, TypeScript and Tailwind CSS.

## What works in this prototype

- Upload a text-based PDF or an image (JPG, PNG, WebP).
- Extract PDF text with PDF.js; run image OCR with Tesseract.js in the browser.
- Heuristically extract payable amount, units, provider, billing days and bill date where labels are recognised.
- Review and manually correct all values before using them.
- Choose any of India's 28 States or 8 Union Territories from the National Portal of India list.
- Base appliance-cost and savings estimates on the entered bill's all-in ₹/kWh average whenever both amount and units are available; otherwise use an explicitly entered fallback rate.
- Estimate a tariff bill separately from the savings workflow. The first verified record is CESC Kolkata Domestic (Rate G), using the official 2025–26 slab schedule and sanctioned-load fixed charge.
- Edit appliance wattage, quantity, usage and usage-reduction scenarios.
- Estimate kWh, costs, potential usage-reduction savings and replacement payback where assumptions are provided.
- Generate a specific savings report from verified calculation inputs, then print/save its dedicated layout as PDF.
- Optionally use OpenAI's server-side Responses API to write the report narrative. Uploaded bill files remain in the browser; only the confirmed calculation fields are sent to the report endpoint.
- Unit tests for calculation logic and text extraction.

## Run locally

Requirements: Node.js 20.9+ recommended.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Optional AI-assisted reports

Copy `.env.example` to `.env.local` and add `OPENAI_API_KEY`. The report route uses the Responses API on the server, so the key never reaches the browser. Without a key, BijliBudget uses its calculation-led report generator and clearly labels the result accordingly.

Run tests:

```bash
npm test
```

Build check:

```bash
npm run build
```

## Calculation assumptions

- Appliance energy = watts / 1000 × quantity × hours per day × days per month.
- Estimated cost = appliance kWh × user-entered effective ₹/kWh.
- Savings estimate = reduced hours × appliance wattage × quantity × days × effective rate.
- Replacement payback = replacement cost / estimated monthly replacement savings.
- Tariff-estimator money values are stored and calculated in integer paise using `bigint`; display formatting happens only after calculation.

These are transparent approximations. Air conditioners, refrigerators and other cycling loads may draw less than their rated power on average. The effective rate is not the same as the marginal cost of an extra unit where tariffs use slabs or fixed charges. The tool must not guarantee savings or declare a bill wrong based on a heuristic.

## Current limitations

- OCR and extraction are best-effort and require user review.
- Scanned PDFs are not rasterised for OCR automatically in this first pass. If a PDF has no text layer, upload a clear page image or enter the values manually.
- The parser handles a few common labels, not every Indian electricity provider's bill layout.
- Tariff coverage beyond the verified CESC Kolkata Domestic (Rate G) record, bill history and cloud accounts are not implemented.
- CESC Kolkata Domestic (Rate G) is the only tariff estimator record currently verified. It excludes variable FPPAS/MVCA, meter rent, duty, rebates, arrears and other bill-specific adjustments when a current official amount or complete calculation basis is not stored. WBSEDCL is source-linked but intentionally unavailable for estimation pending schedule normalisation.
- The fallback rate defaults to ₹8/kWh and is used only until both bill amount and units are supplied. State-wide tariffs are not applied because actual tariffs vary by DISCOM, customer category, slab, fixed charges and subsidies.
- No uploaded bill is sent to a BijliBudget server in this prototype. OCR runs in the browser; PDF text extraction also runs in the browser.

## Next improvements

1. Add provider-specific extraction templates (start with CESC) and confidence per field.
2. Render scanned PDF pages to images and OCR them.
3. Let users compare two or more bills.
4. Use current official tariff schedules for provider-specific bill estimates, with source links and effective dates.
5. Add accessibility and browser testing.
