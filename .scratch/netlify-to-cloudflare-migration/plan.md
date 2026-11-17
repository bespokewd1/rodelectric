# Rod's Electrical hosting and forms migration

Last updated: 2026-11-17.

## Scope and authorization

The user initially authorized saving the handoff and exploring the site's existing forms. They subsequently authorized creating the Web3Forms form with the agency Gmail as temporary recipient and preparing the local integration, deferring client email linking. No live form submissions have been sent. No commits, pushes, deployments, or DNS changes are authorized by this setup request.

Use [handoff.md](./handoff.md) for the original migration playbook. It describes another site's experience, not this site's current deployment state.

Work order: Web3Forms, then parallel Cloudflare deployment, then Decap CMS with DecapBridge. Preserve the existing design, fields, and behavior. Keep Netlify live during testing. Do not push replacement forms until the intended recipient is verified and explicitly selected in Web3Forms.

## Progress

- [x] Save original handoff in this directory.
- [x] Inspect repository build settings, form markup, scripts, and usage.
- [x] Confirm Netlify Forms integration in source.
- [x] Resolve Web3Forms and fetch current submission documentation with Context7.
- [x] Create a separate Web3Forms form and obtain its public key using the current Free account.
- [ ] Confirm client-selected notification recipient and available linked-email capacity when linking.
- [ ] Confirm recipient verification and selection in the Web3Forms form settings.
- [x] Implement Web3Forms after authorization, preserving the existing inline feedback flow.
- [x] Run production build and meaningful mocked submission checks.
- [ ] Commit only authorized, relevant changes. Push separately when authorized and recipient gate is met.
- [ ] Verify deployments and authorized live submission with actual inbox receipt.
- [ ] Configure and test parallel Cloudflare hosting.
- [ ] Replace starter CMS configuration with this site's own DecapBridge setup.
- [ ] Plan authorized domain cutover and rollback after verification.

## Repository facts

| Setting | Evidence / value |
| --- | --- |
| Working directory | `F:/projects/part-time/rodelectric` |
| Repository | `bespokewd1/rodelectric` from Git origin |
| Current branch | `main`; hosting production branch not checked |
| Inspected HEAD | `157bbb0` Improve site accessibility and responsive image loading |
| Framework | Astro, package range `^6.1.9` |
| Build command | `npm run build`, runs `astro build` |
| Output directory | `dist`, declared in `netlify.toml`; no output override seen in Astro config |
| Canonical origin | `https://rodselectrical.com` in `astro.config.mjs` |
| Netlify build plugin | `netlify-plugin-cache` for Astro caches |
| Node version | No explicit version declaration found in inspected package/config files; verify before deployment |
| Cloudflare name, temporary origin, compatibility date | Not selected |
| Web3Forms form key and recipient | Public key in `src/data/web3forms.ts`; agency Gmail is the temporary recipient, client address pending |
| CMS editor | Not confirmed |

No repository or ancestor AGENTS.md was found at the checked workspace ancestor paths. Follow the AGENTS.md instructions supplied in the conversation, including Context7 resolution before documentation queries.

Pre-existing untracked `emails/` was left untouched. No files were staged or committed.

## Existing form inventory

One shared form implementation was found: `src/components/Process/OurProcessQuoteForm.astro`.

- Form name `quote-request` comes from `src/data/quoteRequestForm.ts`.
- Netlify integration uses `method="POST"`, `data-netlify="true"`, `netlify-honeypot="bot-field"`, and hidden `form-name`.
- The hidden spam field is named `bot-field`.
- All five visible fields are required: `full-name`, `phone-number`, `email-address`, `service-needed`, and `project-details`.
- Service options come from `src/data/quoteRequestForm.ts`: Residential Electrical, Commercial Electrical, Repairs & Troubleshooting, Lighting Installation, Panel Upgrades & Inspections.
- ContactForm embeds the shared form on `/contact` and `/about`.
- OurProcess embeds it in its form variant, explicitly used on `/services` and `/cctv-security-cameras`. The homepage uses the default image variant and does not embed this form through OurProcess.
- No other source form implementation or Web3Forms integration was found in the searched `src/` and `public/` files.

The inline script prevents default submission, calls native `reportValidity()`, disables the submit button, and changes its text to Sending. It URL-encodes FormData and posts to `window.location.pathname`. It currently treats any successful HTTP status as success, resets the form, and displays inline Request received feedback. Errors retain field values and show retry/call feedback. The status container has `aria-live="polite"`, `aria-atomic="true"`, and `role="status"`.

There is no thank-you redirect in this implementation, and no thank-you/success page was found by the filename search. Preserve inline success rather than copying the reference site's redirect behavior.

The form binds on initial execution, `astro:page-load`, and `astro:after-swap`, with per-form binding guards and a global listener guard. `BaseLayout.astro` uses ClientRouter, so any migration must preserve navigation initialization. The submit button is disabled during requests, but there is no explicit in-flight guard in the handler.

These findings establish Netlify coupling in source. Netlify dashboard form detection, deployed behavior, notification recipients, delivery, and historical submissions were not checked.

## Web3Forms implementation considerations

Current docs were fetched on 2026-11-17 using:

1. `npx ctx7@latest library "Web3Forms" "HTML contact form JavaScript AJAX submission endpoint access_key success response redirect and honeypot"`
2. `npx ctx7@latest docs /surjithctly/web3forms-docs "Submit a contact form with JavaScript fetch to the API: access_key, JSON payload, HTTP and success checks, error feedback, custom redirect after AJAX success, honeypot botcheck deprecation"`

The retrieved API documentation describes POST `https://api.web3forms.com/submit`, required public `access_key`, optional `subject`, and an `email` field used for reply-to. The current `email-address` field needs deliberate mapping to `email` or the documented `replyto` field to support replying to the visitor. Preserve visible labels and required validation regardless of payload mapping.

Adapt the current handler to check both HTTP status and API `success`, retain input after failures, add an explicit in-flight guard, and fail visibly for a missing key. Remove Netlify detection fields and attributes only during implementation. Keep existing inline status styling and transitions support. Do not copy the documentation sample's unconditional form reset after errors.

For AJAX, the docs say not to use the hidden HTML `redirect` field. This site's existing inline success flow requires no redirect.

The retrieved API reference lists `botcheck`, but this lookup did not resolve the handoff's honeypot deprecation warning. Verify current spam-protection guidance separately before choosing protection. Do not assume the Netlify `bot-field` is portable or sufficient.

No GA4/GTM/dataLayer installation was found in the inspected source/public search. This does not establish external dashboard configuration. Do not add tracking or send form personal data to analytics as part of this migration.

Documentation sources:

- https://docs.web3forms.com/getting-started/api-reference
- https://docs.web3forms.com/how-to-guides/html-and-javascript
- https://docs.web3forms.com/getting-started/troubleshooting

## Later CMS work

`public/admin/config.yml` already mentions DecapBridge, but its repository and site URL still identify the CodeStitch starter, not this repository. Do not consider CMS migrated or working. Its entry page is `src/pages/admin.astro`, not `public/admin/index.html`, and loads `decap-cms@^3.10.0`. Preserve blog fields, media paths, and custom preview code during later authorized work. No login or publishing was tested.

## Validation and rollout status

Initial exploration was documentation-only. See the completed implementation and validation entry below for current status. No commits, pushes, deployments, client verification, inbox checks, or CMS checks have occurred.

## Web3Forms dashboard setup, 2026-11-17

The user subsequently authorized setting up Web3Forms through the computer-use skill in their existing Chrome tab. Opened the Create New Form dialog and populated the unsaved name `Rod's Electrical - Quote Requests` and website URL `https://rodselectrical.com/contact/`.

The dashboard shows Free, usage 0/250 this month, and 1/2 linked-email slots used. The existing linked address belongs to the reference site and is still marked unverified. A different client's address was already typed into the Linked Emails input on arrival; it was not submitted or modified.

Initially paused with the dialog prepared to ask for the recipient. The user then explicitly authorized creating the form with the agency account address as temporary recipient, deferring client linking.

## Web3Forms implementation completed locally, 2026-11-17

- Created `Rod's Electrical - Quote Requests` for `https://rodselectrical.com/contact/` in the existing account through Chrome using the computer-use skill.
- Form Setup: https://app.web3forms.com/forms/63cb7248-3764-40f7-b3ed-d273b644efda/setup
- The selected recipient at creation was `bespokemusicapp@gmail.com`. The user will link, verify, and select the client's address later.
- Retrieved the public Form Access Key from Form Setup and stored it in `src/data/web3forms.ts`. No private account credentials were accessed or stored.
- Changed the shared `OurProcessQuoteForm.astro` to POST JSON to Web3Forms. Removed Netlify detection attributes, `form-name`, and `bot-field`.
- Preserved all five visible required fields, service options, styling, inline status messages, and Astro navigation initialization. Payload names now use `name`, `phone`, `email`, `service-needed`, and `message`. The standard `email` field supports reply-to.
- Added subject and website sender label, missing-key checks, HTTP plus API success checks, an explicit in-flight guard, and `aria-busy`. Errors retain entered values; only confirmed API success resets the form.
- Used the documented hidden `botcheck` checkbox for this initial integration. Current Context7 spam-protection docs explicitly mark honeypots deprecated and weak. This limitation was communicated; stronger CAPTCHA protection remains a rollout decision. No external CAPTCHA script or visible widget was introduced.

Validation passed:

- `npm run build`, static build completed for 8 pages. Build emitted Node deprecation and stale Browserslist data warnings; neither prevented completion.
- `node .scratch/netlify-to-cloudflare-migration/check-form.cjs`, mocked handler checks for success, concurrent submission prevention, native validation, missing key, filled honeypot, HTTP failure, API rejection, malformed JSON, network errors, retained input after errors, and repeated Astro initialization.
- Built HTML checks confirmed Web3Forms action/key, all five required fields, inline accessible status, and removal of Netlify detection fields on `/about`, `/contact`, `/services`, and `/cctv-security-cameras`.
- `git diff --check` passed.

No live requests or test emails were sent, and no inbox delivery was verified. No application changes are committed, pushed, or deployed. Existing Netlify hosting and CMS configuration remain unchanged. The pre-existing `emails/` directory was left untouched.

Next: user links and verifies the client email, then selects it in this form's Settings. Confirm that selection before an authorized push or live delivery test. Cloudflare deployment and DecapBridge setup remain pending.

## Local commit, 2026-11-17

The user authorized committing the completed changes. This plan, the original handoff, mocked checks, public-key configuration, and shared form implementation are included in the local Web3Forms migration commit. The earlier uncommitted status describes the implementation handback before this request. Nothing is pushed or deployed; client recipient linking, verification, selection, and real inbox delivery remain pending. The unrelated `emails/` directory is excluded.
