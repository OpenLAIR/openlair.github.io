# AutoResearch @ NeurIPS 2026 — workshop website

Single-page static site for the **AutoResearch** workshop proposal. Aesthetic
direction: *agent terminal / live trace* — a dark instrument-panel theme that
echoes the workshop's signature live on-stage agent demo.

```
site/
├─ index.html              # all content + section markup
├─ assets/
│  ├─ css/style.css        # full theme (CSS variables at the top)
│  ├─ js/main.js           # typed hero, scroll reveal, nav spy, mock dashboard
│  └─ img/                 # drop speaker / sponsor images here
└─ README.md
```

## Preview locally

It's a static site — no build step. Either open `index.html` directly, or serve
it (recommended, so font/asset paths behave like production):

```bash
cd site
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy to GitHub Pages

The site is served as a **subpath of the OpenLair org page**:
**https://openlair.github.io/autoresearch/**

1. In the `openlair/openlair.github.io` repo, create a folder named `autoresearch/`.
2. Copy the **contents of `site/`** into it (so `index.html` lands at
   `autoresearch/index.html`). All in-page asset paths are relative, so they
   resolve correctly under the subpath — no edits needed.
3. Commit + push to the repo's default branch; Pages publishes it within a minute.

```bash
# from this repo, with the org page checked out alongside:
rsync -a --delete site/ /path/to/openlair.github.io/autoresearch/
cd /path/to/openlair.github.io && git add autoresearch && \
  git commit -m "Add AutoResearch @ NeurIPS 2026 workshop site" && git push
```

The absolute social/SEO URLs in `index.html` (`og:url`, `og:image`,
`twitter:image`, `canonical`, JSON-LD) are already set to
`https://openlair.github.io/autoresearch/`. If the path ever changes, update
those six lines in the `<head>` to match.

## Things to fill in before going live

All placeholders are intentional — search the codebase for these:

| What | Where |
|------|-------|
| **OpenReview URL** | `assets/js/main.js` → set the `ORURL` constant. Every `[data-openreview]` link then points there; until set, those links show a "portal opens on acceptance" notice. |
| **Contact email** | `index.html` footer (`autoresearch-workshop@googlegroups.com` is a placeholder). |
| **Organizer names / affiliations** | Deliberately omitted for a public site (just a footer line: "Organizing committee announced on acceptance"). To add a roster, drop a new `<section id="organizers">` with `.person` cards (same markup as the speakers grid). |
| **Speaker photos** | Optional. Currently monogram avatars. To use real photos, replace the `.avatar` `<div>` with `<img class="avatar" src="assets/img/....jpg">`. Speakers are marked *tentative* — drop the `.tentative-flag` once confirmed. |
| **Dates** | `index.html` → `#dates` table + `#updates` log. Marked tentative pending acceptance. |
| **Sponsor logos** | `index.html` → `#sponsors` (`.logo-slot` placeholders). |
| **Final location** | Shown as *Atlanta · tentative* in the hero meta (`#top`) and footer. Update both once NeurIPS confirms the venue (preference order Atlanta → Sydney → Paris). |
| **Site URL / social card** | Set to `https://openlair.github.io/autoresearch/` across the `<head>` (`og:url`, `og:image`, `twitter:*`, `canonical`, JSON-LD). Only revisit if the deploy path changes. |

## Editing notes

- **Light / dark themes.** A toggle in the nav (sun/moon) switches between the
  dark "agent terminal" theme and a light "paper terminal" theme. The choice is
  saved to `localStorage` (`ar-theme`); first-time visitors default to their OS
  `prefers-color-scheme`. An inline script in `<head>` applies the theme before
  paint to avoid a flash. Dark is the design default — light is defined in the
  `:root[data-theme="light"]` block in `style.css`.
- **Theme colors / fonts** live in the `:root` block at the top of `style.css`.
  Primary accent is phosphor cyan (`--cyan`), secondary is amber (`--amber`).
  Theme-flippable values use semantic vars (`--nav-bg`, `--hover`, `--hero-grad`…).
- The **mock live dashboard** (`#demo`) is purely decorative — numbers are
  animated client-side, not real. It illustrates the live-demo format.
- Fonts load from Google Fonts: **Martian Mono** (display), **IBM Plex Mono**
  (code/labels), **IBM Plex Sans** (body). Swap the `<link>` in `<head>` to change.
- Respects `prefers-reduced-motion` — all animation is gated.
- **Social share card.** The 1200×630 card used by `og:image` / `twitter:image`
  (`assets/img/og-card.png`) is composed deterministically from the site's own
  fonts/colors via the template `assets/og/og-card.html` (not linked from the
  site). Regenerate after editing the template:
  ```bash
  cd site
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless --disable-gpu --window-size=1200,630 \
    --screenshot=assets/img/og-card.png "file://$PWD/assets/og/og-card.html"
  ```

## Structure & lifecycle

Section order (single-page scroll): hero → status line → overview → topics →
**live demo** → call for papers → dates → schedule → speakers → sponsors → footer.
The live-demo section is placed high on purpose — it's the signature hook. The
detailed reviewing/policy rules live inside a collapsed `<details>` in the CFP
section so the two tracks stay front-and-center.

Workshop sites re-order as the event nears. The nav currently leads with the
**live demo + submit** (submission phase). Closer to December 2026, promote
**Schedule / Speakers** and add an **Accepted Papers** section after reviews.
