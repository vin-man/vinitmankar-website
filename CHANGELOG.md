# vinitmankar.com — export notes

This site is exported from the Design canvas ("Vinit Mankar Portfolio — editing canvas").

## Reconstruction or patch?

- `index.html` (homepage): a **reconstruction** of the canvas page. The original `index.html`, `app.js` and hero scripts are replaced by the canvas design: a new nav with the Work menu and accent shimmer, the smoke background, the glass Möbius (three.js), the footer word swap with the Möbius dot loader, "Next project" cards and the 3-second intro reel. The Work card for the Domain Search & Registration Agent uses a still of the laptop prototype from the top of that case study. It runs on `dc-runtime.js`, a small runtime that renders the canvas template and its logic. Tweaks are baked in at their canvas values.
- `case-studies/domain-agent.html`: a **reconstruction** of the canvas page (DomainAgent.dc.html). The content and scripts are the original; the top navigation was replaced with the homepage nav (Work menu, Möbius loader) and a light-blue page tint matching its Work-menu colour.
- `case-studies/domain-agent-studio.html`: original source **patched**. The canvas title edit ("Domain Name Registration Agent") was carried over. It is unlinked; the original layout is the one linked from the homepage.
- `case-studies/domain-upsell.html`: a **reconstruction** of the canvas page (DomainUpsell.dc.html), published at the owner's request.
- `static-states.css`: the settled hero, layout and overlay states the canvas design was built on, plus a mobile fix that keeps the long wordmark inside narrow screens.
- `assets/canvas/`: images added on the canvas (intro reel portraits).

## Updating

1. Edit on the canvas.
2. Re-run the export.
3. Commit and push to `main`. GitHub Pages republishes in about a minute.
