# Federal Criminal Common Law Atlas

A static, searchable companion to the federal criminal common-lawmaking census. The Atlas includes:

**Live site:** https://danepps.github.io/fedcrimatlas/

- change-over-time figures for the 896-case corpus;
- a Hudson & Goodwin genealogy of 76 verified judicial uses across five interpretive phases;
- filters and coded evidence for every included case;
- a direct, case-slugged CourtListener full-opinion link for every included case; and
- a methods page describing double coding, adjudication, prompt sensitivity, unresolved smaller disputes, and the dated record of the preregistered human validation study; and
- a plain-English "How it works" explainer.

## Refresh the data

From the parent project directory:

```bash
python3 Database/scripts/build_atlas_data.py
```

The generator reads `Database/fccl.db`, uses `v_included` and `v_winning_codes`, and writes `app/data/atlas-data.json`. The binary headline is calculated with the canonical `value NOT LIKE 'none%'` rule.

## Local development

```bash
npm install
npm run dev
```

The development site is available at `http://localhost:3000/` by default.

## Validate both deployment targets

```bash
npm test
npm run build:pages
```

`npm test` validates the Vinext/Cloudflare build. `npm run build:pages` produces a fully static Next.js export in `out/`.

## Publish with GitHub Pages

This directory is its own Git repository and includes `.github/workflows/pages.yml`. Push it to a GitHub repository, enable **Settings → Pages → Source: GitHub Actions**, and run the workflow. The workflow computes the repository subpath automatically and deploys the static `out/` directory.

No database server, API key, or runtime environment variable is required. All Atlas data is bundled at build time.

## Data cautions

- The 445/896 (49.7%) headline and acknowledgment distribution are final under codebook v0.7 (2026-09-26); the v0.6 figure was 460/896 (51.3%). `meta.codebook` and `meta.cutoff` are read from the heading of `Database/codebook.md`.
- The human validation study (two RAs, 168-case stratified sample, preregistered 2026-08-27) is in progress: calibration complete, 20-case pilot opened 2026-10-09. The dated status record is hardcoded in `app/atlas-app.tsx` (`VALIDATION_RECORD`) and the `adjudication_flow` stages in `build_atlas_data.py`; update both when the pilot or a wave closes.
- Mode, hook, and source-use detail remains provisional because smaller disputes were intentionally not adjudicated.
- Modes and acknowledgments are nonexclusive.
- The general citation graph is a regex-derived floor.
- Full-opinion links use CourtListener's required `/opinion/<cluster>/<case-name>/` route and point to an open-access copy rather than an official U.S. Reports copy.
- Hudson role labels are nonexclusive research tags; the site preserves the passage and record status so readers can audit them.
