# PermaQR — Permanent URL to QR Code Generator

A 100% client-side, zero-backend static web application that encodes URLs directly into standard ISO/IEC 18004 QR codes. Because no short-link redirect server is used, generated QR codes **never expire**, have **unlimited scans**, and work forever.

## Features

- **Permanent Direct Encoding**: Encodes your exact URL directly inside the browser.
- **Vector SVG & High-Res PNG Export**: Download infinite-scale `.svg` files or crisp `.png` exports up to `4096px`.
- **Contrast Safety Check**: Live WCAG contrast ratio check warns if custom foreground/background colors may be hard for phone cameras to scan.
- **Local Center Logo & Print Caption**: Embed an optional logo (processed locally in the browser) and automatic Level H (30%) error correction.
- **Browser History**: Save and reload favorite QR configurations using `localStorage`.

## Run Locally

```bash
npm install
npm run dev
