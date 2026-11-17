# Handoff: migrate another client website from Netlify

Prepared 2026-11-17. Next session: repeat the proven migration workflow for a different client repository.

## User intent and task order

Use this order: **Web3Forms -> Cloudflare deployment -> Decap CMS with DecapBridge**. Keep the current website design, fields, and functionality. Prefer free tiers and one Cloudflare deployment per site. Keep Netlify live while testing Cloudflare. A push to the production branch should eventually trigger both hosting pipelines until cutover.

Do the work in the target site's repository. This handoff is a playbook, not authorization to publish, change DNS, send client messages, create charges, or make content changes for a different client. Preserve unrelated user edits. Do not copy the reference site's keys, endpoints, recipient addresses, repository owner, or deployment name into another site.

## Reference artifacts: read rather than reproduce

Reference repository: `F:/projects/part-time/SquadVPlumbingInc`.

- Detailed decisions/progress: `.scratch/cloudflare-migration/plan.md`. Some opening/current-evidence sections describe pre-migration state; prefer the dated implementation sections, actual files, and the current-state note below.
- Web3Forms implementation: commit `ef0598f`, including `src/content/pages/contact.html`, `src/assets/js/contact.js`, `src/assets/less/contact.less`, `src/_data/web3forms.json`.
- Mocked form behavior checks: `.scratch/cloudflare-migration/check-form.cjs`.
- DecapBridge implementation: commit `2441306`, including `src/admin/config.yml` and `src/admin/index.html`.
- Original Netlify build/plugin behavior: `netlify.toml`, `plugins/netlify-plugin-indexnow/index.js`.
- Future analytics/dashboard brief: `F:/projects/part-time/bespoke-dashboard/emails/nov-16/tasks.md`. This is analytics/reporting work after migrations, not a requirement to build a CRM now.

Inspect these using absolute paths when working in a different repository. Reuse the patterns, not entire files without adaptation. No sensitive credentials or personal contact details are reproduced here.

## Current reference-site state

- Web3Forms integration and DecapBridge PKCE integration are committed locally; neither commit has been pushed in this conversation.
- Local production build and form mock checks passed. Actual notification receipt, interactive CMS login, and publishing have not been verified.
- Cloudflare deployed the older remote code successfully on a temporary `workers.dev` URL. The custom domain remains on Netlify.
- The user sent the client's DecapBridge collaborator invitation; the latest screenshot shows the collaborator and an invitation-sent confirmation. Acceptance/login is unconfirmed.
- Web3Forms recipient verification/selection remains unconfirmed. Do not assume a CMS invitation acceptance also verifies Web3Forms; they are independent services.
- Once the recipient is verified AND selected for notifications, the user intends to push both commits, wait for both deployments, then test the live form and CMS.
- IndexNow migration and domain cutover remain later work.

## Suggested skills

Use the Skill tool when available, otherwise read each applicable SKILL.md using its documented mechanism:

- `unslop`: always apply to writing.
- `find-docs`: verify current service/library behavior with Context7.
- `cloudflare`: select/check hosting architecture. Read `wrangler` before using Wrangler CLI, and `workers-best-practices` if writing actual Worker code.
- `impeccable`: if changing form feedback, accessibility, or UI. Preserve existing styling; this is not a redesign.
- `computer-use:computer-use`: only if explicitly asked to operate the UI and that is the appropriate available mechanism.
- `handoff`: if producing an updated session handoff.

Do not invoke website-generation tooling to replace an existing repository site. Do not delegate unless the user or applicable instructions ask for it.

## 0. Inspect the target site and collect per-site values

Read its AGENTS.md, package.json, build configuration, Netlify settings, actual form markup/scripts, CMS entry page/config, and existing analytics tags. Use `rg` for searches. Determine the real build command, output directory, production branch, Node requirements, routing, and post-deployment hooks. Do not assume every site uses Eleventy or `public/`.

Record the following in a target-site migration plan:

| Placeholder | Meaning |
| --- | --- |
| `<OWNER>/<REPO>` | Actual GitHub repository |
| `<BRANCH>` | Branch Netlify and Cloudflare should build |
| `<BUILD_COMMAND>` | Existing production build, e.g. `npm run build` |
| `<OUTPUT_DIR>` | Generated static directory, e.g. `./public` |
| `<WORKER_NAME>` | Unique Cloudflare deployment name |
| `<CANONICAL_ORIGIN>` | Existing public custom domain |
| `<TEMP_ORIGIN>` | Cloudflare-generated testing origin |
| `<FORM_KEY>` | New site's public Web3Forms form key |
| `<RECIPIENT>` | Client-confirmed notification email; do not infer from old site data |
| `<CMS_EDITOR>` | Client-confirmed CMS login email, potentially different from recipient |
| `<COMPAT_DATE>` | Fixed supported compatibility date selected for this deployment |

## 1. Web3Forms

### Account/UI setup

1. Use the agency Web3Forms account if recipient/site allowances fit. Create a separate, clearly named form for this website.
2. Website URL: its existing canonical contact page. This does not require moving DNS first.
3. Under Linked Emails, add the client-confirmed recipient. The client follows Web3Forms' verification email link.
4. After verification, explicitly select that email as this form's notification recipient. Verification alone does not select it. Avoid accidentally leaving the agency login email as recipient.
5. Obtain the public form access key from Form Setup. It is intentionally browser-visible. Distinguish it from private account-management API credentials.

### Repository work

Adapt the reference commit while preserving the target's UI and existing script behavior:

- Endpoint: `https://api.web3forms.com/submit`, POST.
- Add public `access_key`, subject, and a useful website sender label.
- Remove Netlify form attributes and Netlify-only form detection fields. Do not send a recipient chosen by the browser as a substitute for account-side recipient setup.
- Retain native required-field validation. Prevent repeated in-flight submissions; keep values after failure; show accessible loading/errors.
- For AJAX, inspect both HTTP status and the API's success value. Redirect to the target site's own thank-you route only after acceptance. Do not combine the HTML redirect field with AJAX submission; follow current docs.
- The reference uses a hidden `botcheck` checkbox. Current docs describe it as deprecated/weak protection. Free hCaptcha is available but may add visible UI. Discuss/implement stronger protection deliberately; never promise a honeypot guarantees spam prevention.
- Do not send names, email addresses, phone numbers, or message text to analytics. Do not introduce duplicate GA4/GTM installations.
- A missing key must fail visibly rather than silently displaying success.

### Validation and rollout gate

Run the site's build and meaningful mocked success/failure checks. Do not send live test emails without authorization. Check no secrets are staged, then commit only the relevant files.

You can finish local implementation while waiting for verification. In the agreed workflow, wait to push the replacement until the client recipient is verified and selected. After deployment, send an authorized test and confirm real inbox delivery. API acceptance alone does not prove delivery.

At the time of this session, free pricing listed 250 monthly submissions, unlimited forms/domains, one recipient per form, and two extra linked addresses beyond the account primary. Do not promise a per-site quota or enough recipient capacity for an entire agency; verify actual account limits. Native Turnstile integration and domain restrictions were paid features. If paid restrictions are enabled, explicitly allow testing origins as required.

## 2. Cloudflare: parallel deployment of the current remote code

### Git connection

Use the same Cloudflare account as the agency/client integration. Go to Workers & Pages -> Create application -> Connect GitHub -> select the target repository.

A GitHub login prompt does not prove there is no existing installation. If the repository is owned by another account and not visible, have that owner authorize the Cloudflare Workers & Pages GitHub App for the specific repository. Do not ask for their password. The client can perform authorization, then the user can configure deployment in the same Cloudflare account.

Do not uninstall an existing GitHub App installation casually: it can disable builds for other projects using it. Check repository selection/organization permissions first.

### Initial dashboard settings without a repo config file

- Project name: `<WORKER_NAME>`.
- Build command: `<BUILD_COMMAND>`.
- Deploy command, replacing every placeholder:

```bash
npx wrangler deploy --assets <OUTPUT_DIR> --name <WORKER_NAME> --compatibility-date <COMPAT_DATE>
```

For the reference site's Eleventy layout, the output argument was `./public`. The important correction from this session: **include `--compatibility-date`** when no Wrangler config supplies it. Omitting it caused deployment to fail after a successful build.

- Advanced Path: `/` for a root-level project; use the actual subdirectory for a monorepo.
- API token: let Cloudflare create the build token automatically; give it a descriptive name if required. No token needs to be copied into source code.
- Set `NODE_VERSION=22` for a project compatible with that version, as in the reference. Check the target's requirements before applying it universally. This build variable is not a secret.
- Do not redundantly set production variables already supplied by the build script. The reference build sets `ELEVENTY_ENV=PROD` itself.
- Preview builds: off during initial main-branch migration. The preview command is irrelevant while disabled; configure it properly before enabling later.
- Protect with Cloudflare Access: off for the public site in this workflow. Use a deliberate preview-protection plan if needed.
- If branch selection is absent during creation, inspect Settings -> Build -> Branch control afterward and confirm `<BRANCH>`; initial selection follows the repository default.

### What the command does

The build creates static files; Wrangler uploads them. `--assets` specifies the generated directory, `--name` chooses the deployment, and the fixed compatibility date pins runtime behavior. Ordinary pushes do not require a new compatibility date, including most Worker edits. Update it deliberately for newer required runtime behavior and test first.

We chose CLI flags so the older remote commit can deploy without pushing local form/CMS changes or first adding `wrangler.jsonc`. A later versioned config plus pinned Wrangler dependency can improve repeatability; do not require it for this initial path.

### Parallel deployment behavior

- Cloudflare initially builds remote `<BRANCH>`, not unpushed local commits.
- Keep Netlify's existing Git integration and `netlify.toml`.
- Later pushes to the connected branch trigger both independently. Both get any Web3Forms/Decap configuration changes in that push.
- Keep the public domain on Netlify while testing the generated `<TEMP_ORIGIN>`.
- The old Netlify Forms integration will not process submissions from the temporary Cloudflare copy. The Web3Forms version will work there after deployment, subject to configured restrictions.
- Direct static-file serving does not use the dynamic Worker request quota. Web3Forms requests go directly to its service. No custom form Worker or Resend is needed for this architecture.
- Dynamic Workers Free requests were limited to 100,000/day across the Cloudflare account, not per project. Builds have separate quotas. Verify current limits before making capacity promises.
- Check deployed assets, internal routes, redirects, headers, canonical URLs, and search indexing behavior for temporary origins. Retain the intended canonical domain.

## 3. Decap CMS with DecapBridge

### Site registration and Git credential

1. Use the agency DecapBridge account, checking its site allowance first. Free supported three sites and ten collaborators per site at this session; six websites do not fit one free account. Do not silently subscribe or promise every site will be free.
2. Add a separate site. Select GitHub and enter `<OWNER>/<REPO>`.
3. Have the repository owner create a fine-grained GitHub PAT through:
   `https://github.com/settings/personal-access-tokens/new`
4. Select the correct resource owner, Only select repositories -> target repository, and repository permissions Contents: Read and write, Pull requests: Read and write. Metadata read-only is automatically included. Record expiration and renewal ownership.
5. Enter the PAT directly into DecapBridge. It is secret and must not enter source, this handoff, screenshots, logs, or chat. If an agent must receive it, use the platform's secure secret tool. Fine-grained tokens have limitations for outside collaborators; do not assume a token from an unrelated developer account can access the client's repo.
6. During migration set the CMS login URL to `<TEMP_ORIGIN>/admin/` or the target's actual admin path. This is a browser return destination, not the Git repository URL.
7. Select PKCE and a clear site name. The setup screen required Decap CMS >=3.8.3. Create site.

### Apply the generated public config

Use the config generated for THIS DecapBridge site. Its PKCE site UUID/endpoints are unique; never reuse the reference site's values.

- Replace the existing backend with the generated `git-gateway`, repository, branch, PKCE base/auth/token/gateway settings.
- Apply generated claim mappings, commit messages, logo, and temporary `site_url` as appropriate.
- Preserve collections, fields, media paths, custom preview code, and intended local-backend behavior. Never overwrite the whole config with the generated fragment.
- Pin a verified PKCE-compatible browser CMS version. The reference moved from `decap-cms@3.0.0` to `decap-cms@3.8.3` in the script URL. Check current package availability/documentation rather than blindly selecting latest.
- Validate YAML; compare collection/media settings before/after; build; inspect the generated admin HTML/config to ensure passthrough copying preserves template placeholders.
- Commit locally. Pushing will include any pending Web3Forms commit too, so honor the form recipient rollout gate.

### Client/editor onboarding

In Manage collaborators, enter `<CMS_EDITOR>` and send the invitation only when authorized. Client accepts the DecapBridge invitation and sets up login. This is separate from Web3Forms recipient verification and does not require the client to use GitHub or the agency's login.

After the code is deployed, open `<TEMP_ORIGIN>/admin/`, log in through DecapBridge, verify existing posts/media and preview, then perform an authorized content publishing check. Publishing to the production branch triggers both hosting pipelines. Check site-specific build requirements: the reference has OG-card asset checks that may prevent a brand-new route from building until its card is exported.

## 4. After both integrations deploy

1. Confirm deployment success on both platforms and confirm real form inbox delivery.
2. Confirm client invitation acceptance and CMS login/publishing; do not equate invite-sent with working login.
3. Before DNS cutover, preserve existing DNS/email records and plan custom-domain HTTPS and apex/www behavior. Keep Netlify available for rollback.
4. Move the custom domain only when authorized and ready. Update DecapBridge's CMS login URL and CMS `site_url` to the canonical domain and retest.
5. Address IndexNow if the site currently uses it. Cloudflare will not execute a Netlify plugin. Adapt a portable post-success-deployment submission script and preserve the sitemap/key file. Keep only one canonical production submission owner during parallel hosting; transfer ownership at cutover. Do not submit temporary test URLs or submit canonical URLs before the changes are live there.
6. Export Netlify form history if needed. Disable the old pipeline only after verification and user authorization.
7. Implement later agency analytics/reporting per its referenced task. Web3Forms is compatible: emit the agreed lead event after accepted submissions, track phone/email clicks separately, and avoid double counting thank-you reloads. Browser analytics is not an authoritative inquiry ledger.

## Documentation and lookup rules

For technology-specific work, follow the target's AGENTS.md and fetch current docs. The user's workflow requires Context7 resolution before docs, up to three commands per question, with no sensitive data in queries:

```bash
npx ctx7@latest library "Cloudflare Workers" "specific task"
npx ctx7@latest docs <resolved-library-id> "specific concept"
```

Resolve `Web3Forms`, `Decap CMS`, and `GitHub` similarly when needed. Do not silently fall back after quota failures. Follow the active execution permission policy; do not pass prohibited sandbox escalation flags.

Official references:

- https://web3forms.com/pricing
- https://docs.web3forms.com/how-to-guides/html-and-javascript
- https://docs.web3forms.com/getting-started/faq
- https://decapbridge.com/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/ci-cd/builds/build-image/
- https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/
- https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/
- https://developers.cloudflare.com/workers/configuration/compatibility-dates/
- https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

## Required final handback from the next agent

State exactly what is configured locally, committed, pushed, deployed, verified by the client, and still pending. Link the target site's migration notes. Report checks without claiming inbox delivery or CMS login from mocked tests. Do not stage unrelated files. Do not push based only on a request to commit.
