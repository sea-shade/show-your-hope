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
live in a separate repository, [`syh-pages`](https://github.com/thelamb/syh-pages),
and are copied into `public/` by the deploy workflow. They are gitignored here, so
a plain `npm run dev` shows the site with placeholder images. To see the real ones,
check out `syh-pages` alongside this repo and link them in:

```sh
ln -s ../../syh-pages/painting_images public/painting_images
ln -s ../../syh-pages/icons public/icons
ln -s ../../syh-pages/translations public/translations
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
  data/         Painting, exhibition, characteristic and selection JSON
  lib/          Painting image URLs and the painting data loader
  index.css     Design tokens, reset and the shared element styles
```

Styling is plain CSS Modules per component, on top of the tokens in `index.css`.
Colours, radii, spacing and type sizes come from those tokens rather than being
written out per file.

Routing uses `HashRouter`, because GitHub Pages serves no rewrites.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which fetches the assets
from `syh-pages`, builds, and publishes `dist/` to GitHub Pages.
