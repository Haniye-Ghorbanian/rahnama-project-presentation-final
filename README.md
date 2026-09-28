# MAPNA · Electric motorcycle presentation

A Persian, RTL presentation with 13 scenes and 71 manually controlled beats. Built with Vite, React, TypeScript, Three.js, React Three Fiber, Drei, and GSAP.

```sh
npm install
npm run dev
```

Open http://localhost:5173. For a production presentation:

```sh
npm run build
npm run preview
```

The production output is in `dist/`. Serve that folder with a local static server; no internet connection is needed during the presentation. Fonts and all assets are bundled locally. Opening `index.html` directly through `file://` is not supported by the browser's ES module rules.

## Presenter controls

| Input | Action |
| --- | --- |
| Space, ArrowRight, or click on the presentation | Next beat, then next scene |
| ArrowLeft | Previous beat, including the previous scene's final state |
| Home | First scene, first beat |
| End | Final scene, final conclusion |
| R | Restart current scene |
| F | Toggle fullscreen |

Small footer buttons provide the same controls. Browser refresh restores the current beat in the same tab. Home returns to the beginning. Holding a key does not unintentionally skip beats. The last frame stays in place. Reduced-motion preferences are respected. Temporary WebGL context loss keeps the existing canvas mounted for browser restoration. If restoration fails, the presentation makes one automatic attempt with a lighter renderer, then tries a lighter WebGL renderer. The presenter can retry 3D with the small arrow button. Returning to the tab also retries the renderer. The current scene and beat are preserved.

## Editing

**All presentation copy, labels, financial figures, and company names are in `src/content/fa.ts`.** Financial bars have paired numeric values in the same file for their visual widths; update these along with their displayed strings when changing figures.

- `src/presentation/navigation.js`: deterministic beat navigation and state validation.
- `src/presentation/usePresentation.ts`: keyboard, fullscreen, and refresh persistence.
- `src/presentation/sceneRegistry.ts`: the 13 ordered scene components.
- `src/scenes/Scenes.tsx`: HTML presentation overlays, financial comparisons, and conceptual monitoring panel.
- `src/three/ThreeStage.tsx`: one persistent canvas, procedural geometry, instanced fleets, service rings, and camera transitions.
- `src/styles.css`: layout, typography, palette, and responsive behavior.

The presentation uses the supplied `گذار به موتور سیکلت (1).docx` as the content source. The document's B2G and B2C expansion labels are preserved, resolving the reversed labels in the implementation brief. The pilot's RL5 Plus model name comes from the embedded source image. Financial units were not added where the document did not specify them. The dashboard is a schematic illustration, without invented numeric operating results.

## Verification

```sh
npm test
npm run build
```

Navigation regression tests exhaustively check all 71 states, reverse traversal, end boundaries, restart, rapid repeated actions, and invalid persisted state. Graphics lifecycle tests cover temporary loss/restoration and listener cleanup during renderer disposal and StrictMode remounts. Browser verification covers keyboard and mouse controls, fullscreen, refresh, persistent canvas, no external requests, and layouts at 1366×768 and 1920×1080. Preview screenshots are in `artifacts/`.
