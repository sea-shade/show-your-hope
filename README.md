# Show Your Hope

The website of [Show Your Hope](https://www.showyourhope.net), an art project that
between 2003 and 2020 collected almost 1000 paintings about Hope from artists all
over the world and toured them through 45 countries in a DAF truck.

A React + TypeScript + Vite single-page app, deployed to GitHub Pages.

## Running locally

```sh
npm install
npm run dev
```

The paintings, their photographs, the filter icons and the catalogue translations
live in a separate repository, [`syh-data`](https://github.com/sea-shade/syh-data),
and are copied into `public/` by the deploy workflow. They are gitignored here, so
a plain `npm run dev` shows the site with placeholder images. To see the real ones,
check out `syh-data` alongside this repo and link them in:

```sh
ln -s ../../syh-data/painting_images public/painting_images
ln -s ../../syh-data/icons public/icons
ln -s ../../syh-data/translations public/translations
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check with `tsc -b`, then build to `dist/` |
| `npm run lint` | ESLint over the whole repo |
| `npm run preview` | Serve the production build locally |

## Layout

```
src/
  components/   Navbar, Footer, Carousel, PaintingTable, image wrappers
  pages/        Welcome, Gallery, WhoAreWe, WorldMap, Tunisia
  data/         The characteristic and selection lists, imported by the app
  lib/          Asset URLs, painting image URLs and the painting data loader
  index.css     Design tokens, reset and the shared element styles
public/
  data/         paintings.json and exhibitions.json, fetched at runtime
```

`paintings.json` is 840KB, so it is served as a static file the browser caches
rather than imported into the bundle, and each route is a separate chunk.

Styling is plain CSS Modules per component, on top of the tokens in `index.css`.
Colours, radii, spacing and type sizes come from those tokens rather than being
written out per file.

Routing uses `HashRouter`, because GitHub Pages serves no rewrites.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which fetches the assets
from `syh-data`, builds, and publishes `dist/` to GitHub Pages. A change in
`syh-data` alone does not rebuild the site: run the workflow by hand, or send
it an `assets-updated` repository dispatch.

Pages serves the site from `/<repository>/`, so the workflow passes that prefix
to Vite as `BASE_PATH` and Vite rebases the paths in `index.html` and in CSS
`url()`. The ones written in components go through `assetUrl` in
`src/lib/assets.ts` instead, which reads the same prefix at runtime. On a custom
domain the prefix is empty and every path is served from the root.
