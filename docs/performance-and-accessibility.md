# Performance and accessibility checks

## Scope

Local improvements approved on 2026-10-22. No deployment was performed.

- Use existing navy `#00284f` for text on light backgrounds across the seven public business pages.
- Preserve brand yellow `#ffcc01`, including passing yellow-on-dark text and decorative accents.
- Crop the process photo within its existing capped box instead of stretching it. Keep the original image files unchanged.
- Add responsive candidates and accurate size hints for the homepage hero, shared trust photo, logos, service cards, and process image.
- Keep the hero preload and image candidate selection aligned. Keep below-fold images lazy.
- Preload the existing shared WOFF2 font with Astro's `Font` component. Do not change its typeface, subset, or weights.
- Correct confirmed accessible-name and keyboard issues found during local checks.

No dependencies, lockfiles, font files, brand constants, hosting configuration, or SEO metadata were changed. The existing disabled dark mode remains disabled. The user's pre-existing untracked `emails/` directory was left untouched.

## Implementation notes

The homepage hero and trust photo share one generated candidate set. Matching requested sizes now use the same URL. Different-sized candidates may still be downloaded where the two display slots differ.

New image candidates, in pixels:

| Image | Candidate widths |
| --- | --- |
| Hero and trust photo | 320, 480, 640, 768, 960, 1280, 1536 |
| Header logo | 80, 112, 160, 224, 288, 336 |
| Footer logo | 144, 288, 432 |
| Service cards | 144, 288, 432, 640, 828, 946 |
| Process photo | 360, 544, 750, 946 |

The hero's fallback width is 960px. Candidate sets retain the original maximum image dimensions rather than upscaling.

Keyboard fixes include visible focus rings, label-in-name corrections, a non-tabbable honeypot, a labelled keyboard-scrollable gallery, a quick-contact navigation landmark, sticky actions that reveal on focus, and consistent navigation disclosure state.

## Local checks

- `npm run build` passed.
- `npm run check:seo` passed. It checks seven business pages, eight social cards, schema, sitemap, and brand icons.
- `node --check src/js/nav.js` and `node --check src/js/mobileStickyCta.js` passed.
- `git diff --check` passed.
- Axe checks passed with zero violations on all seven business routes at both 390 x 844 and 1440 x 1000 viewports.
- Browser checks found no broken local images, horizontal overflow, or JavaScript errors on those routes.
- The image-fit check found no stretched images with default fill fitting and a ratio error above 5% across those 14 cases.
- Before/after screenshots confirm the intended navy labels and natural process-photo crop.
- High-DPR checks at mobile 390px/DPR 3 and desktop 1440px/DPR 2 found no broken images or duplicate hero candidate downloads.
- Settled keyboard checks passed for navigation disclosures, the sticky actions, FAQ expansion, and gallery scrolling. The navigation also worked after Astro page transitions.

Routes checked: `/`, `/about/`, `/services/`, `/cctv-security-cameras/`, `/contact/`, `/projects/`, `/reviews/`.

Form submissions and external links were not activated. The external Google Maps iframe on Contact was blocked by the browser test safeguard, so its third-party behavior was not validated. Local static hosting cannot validate Netlify form delivery. Axe checks are automated evidence, not a full WCAG or screen-reader audit.

## Lighthouse results

The baseline and final build used the same local gzip server settings. Mobile scores are medians of three runs. Desktop scores are from one run.

| Device and build | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Mobile baseline | 99 | 96 | 100 | 100 |
| Mobile final | 98 | 100 | 100 | 100 |
| Desktop baseline | 100 | 96 | 96 | 100 |
| Desktop final | 100 | 100 | 100 | 100 |

Final mobile performance runs were 96, 98, and 98. The 96 run had a slower Speed Index and remains in the results. No run was discarded.

| Mobile metric | Baseline median | Final median |
| --- | ---: | ---: |
| First contentful paint | 1.355s | 1.084s |
| Largest contentful paint | 1.805s | 2.330s |
| Speed Index | 1.355s | 1.172s |
| Total blocking time | 0ms | 0ms |
| Cumulative layout shift | 0.01896 | 0 |

Mobile performance 100 was not achieved. Final simulated LCP is slower than the baseline despite smaller images. These checks do not establish a mobile speed-score improvement. The cause of the difference between Lighthouse's observed and simulated timing was not established. Scored values above use the normal simulated metrics, not the unthrottled trace.

A separate uncompressed browser capture after loading lazy images measured local resource bodies at 978,960 to 510,232 bytes on mobile and 1,609,549 to 865,119 bytes on desktop. These reductions are about 48% and 46%. They are not initial-load or deployed transfer-size measurements.

## Measurement method

Lighthouse uses the production static build and installed Chrome, with mobile throttling or the desktop preset. Runs are sequential. The primary comparison uses the same temporary gzip-capable static server implementation for the unchanged baseline and revised build. Mobile results use three runs for each version; desktop uses one run for each version.

An earlier uncompressed-server series is diagnostic only. Its slower mobile scores should not be compared with deployed PageSpeed results or mixed into the gzip comparison.

These are local lab results, not a promise of deployed PageSpeed scores or real-user Core Web Vitals. Server latency, compression, caching, and test conditions can change the numbers. The supplied PageSpeed report had no CrUX data.

## Optional experiments

The font preload was the only optional loading change retained. Three temporary-copy mobile runs reduced median FCP from 1504ms to 1066ms and CLS from 0.01896 to 0. LCP stayed about 2330ms, and performance remained 98. Desktop performance remained 100. The final source build was checked again after applying Astro's supported `preload` prop. It emits one preload for the existing 37,520-byte Latin WOFF2 file shared by weights 400, 700, and 900.

CSS inlining was tested in a separate temporary copy and rejected. One mobile run still scored 98. It added about 15.8KB to the compressed HTML and removed separately cached CSS for only a small LCP difference. Production CSS delivery is unchanged.

## Deployment follow-up

After deployment, run PageSpeed for mobile and desktop on the homepage and spot-check the other public pages. Confirm accessibility and desktop aspect-ratio failures remain cleared. Compare several mobile runs before considering any further CSS or font-loading changes.

## Evidence

Detailed JSON, screenshots, HTML Lighthouse reports, test scripts, and source/build hashes are retained outside the repository at:

`C:/Users/tingDev/AppData/Local/Temp/rodelectric-improve-kc3h2ot6/validation`

The final source build uses the `after-source-final` artifact prefix. Earlier `after-final` files describe the build before font preloading. Temporary font and CSS experiments are not the final production build.

Astro's current [Font component documentation](https://docs.astro.build/en/reference/modules/astro-assets/#font) and [CSS build configuration](https://docs.astro.build/en/reference/configuration-reference/#buildinlinestylesheets) were checked directly after the Context7 documentation service reported its quota was exhausted.
