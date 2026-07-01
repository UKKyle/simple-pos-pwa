# Simple POS PWA.

A clean, dark, tablet-first point of sale Progressive Web App for small businesses. It is an original implementation inspired by common modern POS interaction patterns: fast product tiles, a persistent basket on larger screens, touch-friendly controls, local order storage, and simple product management.

## Features

- POS product grid with search and one-tap add to basket
- Basket quantity controls, item removal, clear cart, subtotal, total, and item count
- Optional customer name, email, and phone capture
- Mark paid by Card or Cash, with completed orders saved locally first and then synced to the Baked By Mady CMS
- Orders tab with search, payment-method filtering, CMS sync status, manual retry, details modal, delete, and CSV export
- Products tab with add, edit, delete, active toggle, search, duplicate-name prevention, and validation
- Settings tab for business name, currency, demo reset, and full local-data clearing
- IndexedDB persistence via Dexie
- Offline-ready PWA support via `vite-plugin-pwa`
- GitHub Pages deployment workflow

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## CMS Sync Configuration

Create a local `.env` file from `.env.example` and set:

```bash
VITE_BBM_POS_INGEST_URL=
VITE_BBM_POS_INGEST_SECRET=
```

These `VITE_` variables are exposed to the built client, so this setup is only appropriate for a private staff-operated POS. The Baked By Mady CMS still protects the ingest endpoint with origin checks, payload validation, duplicate detection, and a shared secret, but this should not be treated as a public untrusted client credential model.

## Deployment

This project includes `.github/workflows/deploy.yml`, which builds the Vite app and deploys `dist/` to GitHub Pages.

Expected repository:

```text
https://github.com/UKKyle/simple-pos-pwa
```

Expected live URL after GitHub Pages is enabled:

```text
https://ukkyle.github.io/simple-pos-pwa/
```

The Vite `base` path is set to `/simple-pos-pwa/` for GitHub Pages.

## Current Limitations

- No payment provider or card reader integration
- Sync uses a private client-visible shared secret, so this is designed for trusted staff devices rather than a public app
- Tax, discounts, refunds, receipts, and inventory tracking are not implemented yet

## Future Upgrade Path

- Add receipt printing and email receipts
- Add tax and discount rules
- Add inventory counts and low-stock alerts
- Add staff PINs and shift reporting
- Add cloud sync and multi-device order history
- Integrate with a payment provider when card-reader requirements are decided
