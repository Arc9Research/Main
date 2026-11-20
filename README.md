# Arc-9 Research (static site)

A small static website for sharing open experiments and questions. No backend: HTML, CSS, and minimal JavaScript, built with [Vite](https://vitejs.dev/).

## Quick start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4317``(the dev server runs `scripts/generate-experiment-pages.mjs` first so `/public/data/` stays in sync).

```bash
npm run build    # output in dist/
npm run preview  # serve dist/
```

## Add or edit an experiment

All entries live in **one file**: [`data/experiments.json`](data/experiments.json).

Each experiment object supports:

| Field | Description |
| --- | --- |
| `id` | URL slug (kebab-case, unique) |
| `title` | Short title |
| `question` | Plain-language open question |
| `whyItMatters` | Why you care / why others might |
| `status` | `idea`, `designing`, `seeking data`, `seeking funding`, or `running` |
| `helpWanted` | Array: `data`, `collaborators`, `funding`, `equipment`, `participants`, etc. |
| `helpNote` | Optional extra detail |
| `tags` | Array of strings for filtering |
| `relatedLinks` | `{ "label", "url" }` objects (can be empty) |

After editing JSON, run `npm run dev` or `npm run build` so copies under `public/data/` and experiment path stubs are regenerated.

Detail pages: `/experiment.html?slug=<id>` (also stubbed at `/experiments/<id>/` for cleaner sharing paths).

## Contact email & Formspree

Edit [`site-config.json`](site-config.json) at the repo root:

```json
{
  "contactEmail": "arc9research@gmail.com",
  "formspreeEndpoint": "",
  "siteUrl": "https://your-domain.example"
}
```

- **`contactEmail`**: Replace the placeholder when you have a real address. The site obfuscates it in the DOM until “Show address” is clicked; mailto links decode it in the browser.
- **`formspreeEndpoint`**: Set to your Formspree form URL (e.g. `https://formspree.io/f/xxxx`) to enable the optional contact form on the home page. Leave empty to keep the form hidden.

Also update Open Graph `og:url` in `index.html` when you know your production URL.

## Deploy

### Vercel

1. Import this repository in [Vercel](https://vercel.com/).
2. Build command: `npm run build`
3. Output directory: `dist`
4. `vercel.json` is included for basic static settings.

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`

### GitHub Pages (this repo)

Production deploys via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on push to `main`.

- **Live URL:** [https://arc9research.github.io/Main/](https://arc9research.github.io/Main/)
- **Base path:** set at build time with `VITE_BASE` (workflow uses `/Main/`). For a future org root site (`arc9research.github.io`), change the workflow env to `VITE_BASE: /` and update repository Pages settings.

Local check matching production:

```bash
VITE_BASE=/Main/ npm run build
npx vite preview --host 127.0.0.1 --port 4317
```

## Project layout

```
data/experiments.json   # source of truth for experiments
site-config.json        # contact + optional form endpoint
index.html              # home: about, list, contact
experiment.html         # single experiment detail template
src/                    # CSS + JS
scripts/                # copies data to public/ before build
public/                 # favicon, generated data copies
```

## License

Content is personal research material; add a license if you plan to open-source the repo itself.