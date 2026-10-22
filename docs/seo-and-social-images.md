# Page SEO and social images

Rod's Electrical uses `https://rodselectrical.com` as its canonical origin. The
business email remains `info@rodselectrical.ca`. The `.ca` email does not change
the website domain.

Seven business pages have individual search metadata and branded social cards:

| Page                      | Route                     |
| ------------------------- | ------------------------- |
| Home                      | `/`                       |
| About                     | `/about/`                 |
| Services                  | `/services/`              |
| CCTV and security cameras | `/cctv-security-cameras/` |
| Contact                   | `/contact/`               |
| Projects                  | `/projects/`              |
| Customer feedback         | `/reviews/`               |

Each page gets a static 1200 × 630 PNG. The build also creates one default card
for other routes. Cards use existing project photos, the cropped Rod's brand
mark, and local Roboto font files. There is no external image API, screenshot
step, or request-time rendering service.

## Preview and check locally

Run these commands from the repository root:

```sh
npm run dev
```

Open `http://localhost:4321/dev/og/`, or use the port Astro prints. The gallery
shows all seven page cards and the default card. Open an image to inspect it at
full size. This gallery is for local development only. A production build does
not generate it or include it in the sitemap. The PNGs themselves are public in
production so sharing services can fetch them.

Check the production output with:

```sh
npm run build
npm run check:seo
```

The checker parses the generated HTML and verifies the page-specific metadata,
canonical URLs, matching Open Graph and Twitter tags, one H1 per page, required
homepage copy, and Electrician structured data. It checks the PNG files with
Sharp for their actual format and 1200 × 630 dimensions, plus a size below 2 MB.
It also checks sitemap and robots URLs, removed route exclusion, the absent
production preview, favicon dimensions, and manifest branding.

These checks run against local `dist` files. They do not contact Google, run a
live sharing inspector, verify hosting redirects, or submit pages for indexing.

## Change page metadata or card content

Edit `src/data/seo-pages.json`. Each entry has these fields:

- `route` is the public page path, including its trailing slash.
- `title` is the complete search title. Include `Rod's Electrical` once. The
  layout does not append another business name.
- `description` is the page's search description.
- `ogTitle` and `ogDescription` supply both Open Graph and Twitter text. These
  can be shorter than the search metadata.
- `photo` is a local source-file path relative to the repository root.
- `headline` and `detail` are text printed on the generated card. A `\n` in the
  headline requests a line break.
- `alt` describes the complete social card. Update it when its photo or message
  changes.

Keep search titles at most 60 characters, search descriptions between 120 and
160 characters, social titles at most 60 characters, and social descriptions at
most 125 characters to pass the current checks. These are project copy targets,
not Google ranking rules or guaranteed snippet lengths. Search engines can
choose different titles and snippets.

Card content is separate from visible page content. Editing a card photo does
not replace a hero image. Editing a metadata title does not replace an H1.
The homepage hero and homepage card currently use the approved
`src/assets/images/gallery/installation/installation3.jpg` photo.

There are no CMS controls for these settings. Decap CMS is not configured for
this work. Edit the repository files, review locally, then rebuild and deploy.

## Developer files

- `src/data/seo-pages.json` contains the seven page records.
- `src/data/client.ts` contains the business identity, contact details and site
  origin.
- `src/components/Meta/Meta.astro` renders canonical, search and social tags.
- `src/layouts/BaseLayout.astro` supplies page paths to the shared metadata.
- `src/js/localBusinessSchema.js` builds the Electrician JSON-LD node.
- `src/lib/seo.ts` resolves page metadata and creates content-hashed card URLs.
- `src/lib/og-image.ts` contains the Satori card layout and Sharp PNG renderer.
- `src/pages/og/[card].png.ts` outputs the eight static PNGs.
- `src/pages/dev/[preview].astro` contains the local-only gallery.
- `scripts/check-seo.mjs` checks the built output.
- `scripts/generate-brand-assets.mjs` creates the cropped brand mark, public
  business photo and favicon set from existing source images.
- `public/assets/favicons/site.webmanifest` contains the app name and icon paths.

Card URLs look like `/og/home-<hash>.png`. The hash includes page data, source
photo bytes, local fonts, the brand mark, business data used by the cards, and
both card-library source files. Changing these inputs changes the image URL
automatically. There is no manual cache-version constant to update. The build
reads local assets rather than downloading them from the deployed website.

Satori, Sharp and parse5 are build or validation dependencies. Production serves
the finished HTML and PNG files. If you change the source logo or approved
business photo, regenerate the committed brand assets before building:

```sh
node scripts/generate-brand-assets.mjs
npm run build
npm run check:seo
```

## Business facts and removed demos

Structured data uses one Electrician identity at
`https://rodselectrical.com/#business`. It includes the confirmed address,
11902 70 St NW, Edmonton, AB T5B 1T9, Canada, the phone `+15873993722`, and the
service area "Edmonton and surrounding areas". Logo and representative-photo
URLs point to public brand files. Empty placeholder social profiles are omitted.
No review or rating data is invented.

The customer feedback page remains at `/reviews/`. It says that this website
has not published verified customer reviews yet and links to contact. It does
not present the starter-kit testimonials as real customer feedback.

The two demo blog posts, the demo blog index, and `/projects/project-1/` and
`/projects/project-2/` no longer produce pages. There is no active blog content
collection. Unused blog layouts and components, plus the unconfigured CMS files,
remain in the repository without publishing those sample routes. No automatic
redirect sends a removed demo URL to an unrelated business page.

## Deployment and indexing checklist

The site owner handles deployment and indexing. After reviewing the local build:

1. Deploy the generated `dist` through the hosting provider's normal process.
   Confirm that it publishes the latest commit and runs `npm run build`.
2. Configure HTTP and `www` requests to redirect to
   `https://rodselectrical.com`, preserving the path and query. If another domain
   should redirect to this one, confirm ownership and the desired behavior
   before adding that redirect. The business email domain alone is not proof.
3. Fetch each public page and its `og:image` URL. Pages and PNGs must return
   successful public responses without login, bot challenges or access blocks.
   Confirm the PNG content type is `image/png` and the preview gallery is absent.
4. Check the public canonical tags, `robots.txt`, and `sitemap-index.xml`. Confirm
   removed demo paths return a real not-found response unless a relevant,
   deliberate redirect has been configured.
5. Rescan pages in a sharing inspector such as opengraph.xyz and the social
   platforms used for sharing. Changed image hashes help refresh the image,
   but platforms can still cache old page metadata until a rescan.
6. Verify the canonical domain in Google Search Console, submit
   `https://rodselectrical.com/sitemap-index.xml`, inspect the seven business
   URLs, and request indexing where needed. Indexing and the displayed search
   snippet remain Google's decision.

No production deployment, live sharing-inspector test, or Search Console
submission is part of the local implementation.

## Dependency notes

A narrow npm override aligns Astro's optional Sharp dependency with the direct
Sharp version. This avoids loading two different native image libraries in one
Windows development process. Another override pins Satori's `fflate` dependency
to 0.7.5 to avoid its malformed-ZIP advisory. No React integration is required.

The repository still has dependency audit findings outside this SEO change.
Review those in a separate dependency-maintenance task before treating the
project as security-audited. Do not run a broad forced upgrade as part of editing
page metadata.
