# Didi Cohen — portfolio website

A bilingual, dependency-free static website for Didi's Rosen Method Bodywork and Kundalini Yoga practice in Jerusalem.

## Preview locally

The locale files are loaded with `fetch()`, so the site must be served rather than opened directly from the filesystem.

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Before publishing

- Replace the generated room images with Didi's own photographs if desired.
- Replace the two explicitly marked testimonial placeholders with approved client quotes, or remove the section.
- Review the accessibility behavior and the short local-storage notice for the final deployment environment.

All visible copy and data live in `locales/he.json` and `locales/en.json`. Keep their key structures identical.

## Deployment

Upload the repository contents to any static host (for example GitHub Pages, Netlify, Cloudflare Pages, or an ordinary web server). No build command or backend is required.
