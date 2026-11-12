# Approved Möbius / dither + serif

Frozen independently of the art-direction playground and browser storage. `approved.json` records the user's selected settings. `source-white.png`, `silhouette-source.png`, and `texture-engine.js` are preserved copies of the approved sources; the displayed PNG is deterministically derived at 384 × 384 with four gray tones and strength .55. No new generation or shape redesign.

```html
<script type="module" src="/components/mobius-approved/mobius-approved.js"></script>
<approved-mobius style="height:600px"></approved-mobius>
```

Load Archivo and Newsreader on the containing page. Default appearance is the approved white-background treatment, serif Creativity / Logic, sans-serif Art / Science, and the unchanged reframe → test → learn note with its original leader/marks. It retains the gentle hover tilt, expressive surface pulse, and no click action. `paused` suppresses ambient animation; reduced-motion preferences suppress animation and hover. `inactive` pauses off-screen ambient animation.

Homepage presentation uses transparent image masking and `mix-blend-mode:multiply` to merge the near-white pixels with the existing paper color. The underlying asset remains grayscale. The page drives the arrival transform and annotation opacity through CSS variables; it is an image-based coin flip, not a newly modeled 3D object.

Standalone checkpoint: `/experiments/mobius-approved.html`. Previous White / Haze study and art-direction playground are unchanged. Homepage source before this integration is backed up in `/experiments/checkpoints/home-before-mobius/` (source backup, not an independent deploy).
