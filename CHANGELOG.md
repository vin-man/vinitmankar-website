# vinitmankar.com — export notes

This site is exported from the Design canvas ("Vinit Mankar Portfolio — editing canvas").

## Reconstruction or patch?

- `index.html` (homepage): a **reconstruction** of the canvas page. The original `index.html`, `app.js` and hero scripts are replaced by the canvas design: a new nav with the Work menu and accent shimmer, the smoke background, the glass Möbius (three.js), the footer word swap with the Möbius dot loader, "Next project" cards and the 3-second intro reel. It runs on `dc-runtime.js`, a small runtime that renders the canvas template and its logic. Tweaks are baked in at their canvas values.
- `case-studies/domain-agent.html`: **unchanged** original source. It was not edited on the canvas.
- `case-studies/domain-agent-studio.html`: original source **patched**. The canvas title edit ("Domain Name Registration Agent") was carried over. It is unlinked; the original layout is the one linked from the homepage.
- `case-studies/domain-upsell.html`: **held back**. The handoff said its figures and screens are not yet cleared for public release, so the public build contains only a short "available on request" page. The full reconstructed case study is exported separately and can be published once cleared.
- `static-states.css`: the settled hero, layout and overlay states the canvas design was built on, plus a mobile fix that keeps the long wordmark inside narrow screens.
- `assets/canvas/`: images added on the canvas (intro reel portraits).

## Updating

1. Edit on the canvas.
2. Re-run the export.
3. Commit and push to `main`. GitHub Pages republishes in about a minute.
