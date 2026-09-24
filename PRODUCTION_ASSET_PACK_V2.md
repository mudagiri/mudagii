# MUDAGIRI Production Asset Pack V2

## Decision
The production mascot is the simple silver-axe pixel chick. The prior ornate black/gold axe + chest emblem generation is legacy and must not be used for the main mascot.

## Directory layout
```
public/assets/
  mascot/
  enemies/
  brand/
```

## Runtime image rules
1. Transparent alpha.
2. WebP runtime delivery; retain approved PNG masters separately when available.
3. No baked page background or checkerboard.
4. No real third-party logo required inside mascot art.
5. UI text/data should normally be rendered by the app, not permanently baked into character art.
6. Preserve pixel edges; do not upscale a coarse source to simulate detail.
7. Do not mix silver-axe and ornate black/gold-axe mascot generations in production.

## Newly locked V2 CTA assets
- alert.webp
- line.webp
- share.webp
- consult.webp
- relief-clear.webp

## Pending source reconciliation
The earlier user-provided silver-axe core poses and the newly approved PROTECT image still need their exact source files mapped before replacing legacy runtime files. Do not guess from generation order.

## Enemy set
36 approved-intent slots remain, subject to final source-to-slot visual reconciliation before packaging.
