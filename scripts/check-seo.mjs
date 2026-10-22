import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "parse5";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "dist");
const origin = "https://rodselectrical.com";
const pages = JSON.parse(
  await readFile(join(root, "src/data/seo-pages.json"), "utf8"),
);
const descriptions = new Set();
const imageUrls = new Set();
const expectedRoutes = [
  "/",
  "/about/",
  "/services/",
  "/cctv-security-cameras/",
  "/contact/",
  "/projects/",
  "/reviews/",
];
assert.deepEqual(
  Object.values(pages)
    .map((page) => page.route)
    .sort(),
  [...expectedRoutes].sort(),
  "Seven approved business routes",
);

function elements(node, predicate) {
  const matches = [];
  function visit(current) {
    if (current.tagName && predicate(current)) matches.push(current);
    for (const child of current.childNodes ?? []) visit(child);
  }
  visit(node);
  return matches;
}

function attribute(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value;
}

function text(node) {
  if (node.nodeName === "#text") return node.value;
  return (node.childNodes ?? []).map(text).join("");
}

function only(nodes, message) {
  assert.equal(nodes.length, 1, message);
  return nodes[0];
}

function metadata(head, key, route) {
  const node = only(
    elements(
      head,
      (item) =>
        item.tagName === "meta" &&
        (attribute(item, "name") === key ||
          attribute(item, "property") === key),
    ),
    `${route}: expected one ${key} tag`,
  );
  const value = attribute(node, "content");
  assert(value?.trim(), `${route}: ${key} is not blank`);
  return value;
}

async function checkPng(path, label) {
  const png = await readFile(path);
  const image = await sharp(png).metadata();
  assert.equal(image.format, "png", `${label}: PNG image`);
  assert.equal(image.width, 1200, `${label}: 1200 pixels wide`);
  assert.equal(image.height, 630, `${label}: 630 pixels tall`);
  assert(png.length < 2 * 1024 * 1024, `${label}: below 2 MB`);
}

function normalizedText(node) {
  return text(node).replace(/\s+/g, " ").trim();
}

function schemaNodes(value) {
  if (Array.isArray(value)) return value.flatMap(schemaNodes);
  if (!value || typeof value !== "object") return [];
  return [value, ...Object.values(value).flatMap(schemaNodes)];
}

function checkBusinessSchema(head, route) {
  const scripts = elements(
    head,
    (node) =>
      node.tagName === "script" &&
      attribute(node, "type") === "application/ld+json",
  );
  const nodes = scripts.flatMap((script) =>
    schemaNodes(JSON.parse(text(script))),
  );
  const business = only(
    nodes.filter((node) => node["@type"] === "Electrician"),
    `${route}: one Electrician schema`,
  );
  assert.equal(
    business["@id"],
    `${origin}/#business`,
    `${route}: stable business identity`,
  );
  assert.equal(business.name, "Rod's Electrical Services");
  assert.equal(business.url, origin);
  assert.equal(business.logo, `${origin}/assets/brand/rod-mark.png`);
  assert.equal(business.image, `${origin}/assets/brand/rod-at-work.jpg`);
  assert.equal(business.email, "info@rodselectrical.ca");
  assert.equal(business.telephone, "+15873993722");
  assert.deepEqual(
    business.address,
    {
      "@type": "PostalAddress",
      streetAddress: "11902 70 St NW",
      addressLocality: "Edmonton",
      addressRegion: "AB",
      postalCode: "T5B 1T9",
      addressCountry: "CA",
    },
    `${route}: approved Canadian business address`,
  );
  assert.equal(business.areaServed, "Edmonton and surrounding areas");
  assert(
    !Object.hasOwn(business, "sameAs"),
    `${route}: no placeholder social profiles`,
  );
  assert(
    !nodes.some(
      (node) =>
        Object.hasOwn(node, "review") || Object.hasOwn(node, "aggregateRating"),
    ),
    `${route}: no unverified reviews or ratings in schema`,
  );
}

for (const [key, page] of Object.entries(pages)) {
  const { route } = page;
  const html = await readFile(join(dist, route, "index.html"), "utf8");
  const document = parse(html);
  const head = only(
    elements(document, (node) => node.tagName === "head"),
    `${route}: one head`,
  );
  const title = text(
    only(
      elements(head, (node) => node.tagName === "title"),
      `${route}: one title`,
    ),
  ).trim();
  assert.equal(title, page.title, `${route}: configured search title`);
  assert(title.length <= 60, `${route}: search title at most 60 characters`);
  assert.equal(
    title.split("Rod's Electrical").length - 1,
    1,
    `${route}: brand appears once`,
  );

  const description = metadata(head, "description", route);
  assert.equal(
    description,
    page.description,
    `${route}: configured search description`,
  );
  assert(
    description.length >= 120 && description.length <= 160,
    `${route}: search description is 120-160 characters`,
  );
  assert(
    !descriptions.has(description),
    `${route}: distinct search description`,
  );
  descriptions.add(description);

  const canonical = only(
    elements(
      head,
      (node) =>
        node.tagName === "link" && attribute(node, "rel") === "canonical",
    ),
    `${route}: one canonical`,
  );
  const pageUrl = `${origin}${route}`;
  assert.equal(
    attribute(canonical, "href"),
    pageUrl,
    `${route}: production canonical URL`,
  );
  assert.equal(metadata(head, "og:url", route), pageUrl);
  assert.equal(metadata(head, "twitter:url", route), pageUrl);
  assert.equal(metadata(head, "og:title", route), page.ogTitle);
  assert.equal(metadata(head, "twitter:title", route), page.ogTitle);
  assert(
    page.ogTitle.length <= 60,
    `${route}: social title at most 60 characters`,
  );
  assert.equal(metadata(head, "og:description", route), page.ogDescription);
  assert.equal(
    metadata(head, "twitter:description", route),
    page.ogDescription,
  );
  assert(
    page.ogDescription.length <= 125,
    `${route}: social description at most 125 characters`,
  );
  assert.equal(metadata(head, "og:type", route), "website");
  assert.equal(metadata(head, "twitter:card", route), "summary_large_image");

  const imageUrl = metadata(head, "og:image", route);
  const image = new URL(imageUrl);
  assert.equal(
    image.origin,
    origin,
    `${route}: production social image origin`,
  );
  assert(
    new RegExp(`^/og/${key}-[a-f0-9]{16}\\.png$`).test(image.pathname),
    `${route}: content-hashed PNG social image`,
  );
  assert(!imageUrls.has(imageUrl), `${route}: distinct social image`);
  imageUrls.add(imageUrl);
  assert.equal(metadata(head, "twitter:image", route), imageUrl);
  assert.equal(metadata(head, "og:image:width", route), "1200");
  assert.equal(metadata(head, "og:image:height", route), "630");
  assert.equal(metadata(head, "og:image:type", route), "image/png");
  assert.equal(metadata(head, "og:image:alt", route), page.alt);
  assert.equal(metadata(head, "twitter:image:alt", route), page.alt);
  assert(page.alt.length > 20, `${route}: descriptive social image alt text`);
  await checkPng(resolve(dist, `.${image.pathname}`), `${route} social image`);

  checkBusinessSchema(head, route);
  const heading = only(
    elements(document, (node) => node.tagName === "h1"),
    `${route}: one H1`,
  );
  assert(normalizedText(heading), `${route}: H1 is not blank`);
  if (key === "home") {
    assert.equal(
      normalizedText(heading),
      "Licensed Electricians in Edmonton for Homes & Businesses",
    );
    const hero = only(
      elements(document, (node) => attribute(node, "id") === "hero"),
      "Homepage hero",
    );
    assert(
      normalizedText(hero).includes(
        "From electrical repairs and troubleshooting to panel upgrades and lighting installations, Rod's Electrical provides reliable service for Edmonton homes and businesses.",
      ),
      "Homepage approved supporting copy",
    );
    assert(
      elements(
        hero,
        (node) =>
          node.tagName === "a" && attribute(node, "href") === "/contact/",
      ).some((node) => normalizedText(node) === "Get a Free Quote"),
      "Homepage quote CTA links to contact",
    );
    const photo = only(
      elements(hero, (node) => node.tagName === "img"),
      "Homepage hero photo",
    );
    const photoUrl = new URL(attribute(photo, "src"), origin);
    const photoFile = await sharp(
      resolve(dist, `.${photoUrl.pathname}`),
    ).metadata();
    assert(
      photoFile.width > 0 && photoFile.height > 0,
      "Homepage hero photo resolves to a built image",
    );
  }
  if (key === "reviews") {
    assert(
      normalizedText(document).includes(
        "We haven't published verified customer reviews on this website yet.",
      ),
      "Reviews page explains no verified reviews are published",
    );
  }
  assert(
    !elements(
      head,
      (node) => node.tagName === "meta" && attribute(node, "name") === "robots",
    ).some((node) =>
      /(?:^|[\s,])noindex(?:$|[\s,])/i.test(attribute(node, "content") ?? ""),
    ),
    `${route}: page is indexable`,
  );
}

const cards = (await readdir(join(dist, "og"))).filter((file) =>
  file.endsWith(".png"),
);
assert.equal(
  cards.length,
  Object.keys(pages).length + 1,
  "One card per business page plus the default card",
);
assert.equal(
  cards.filter((file) => /^global-[a-f0-9]{16}\.png$/.test(file)).length,
  1,
  "One content-hashed default card",
);
for (const file of cards) await checkPng(join(dist, "og", file), file);

const removedRoutes = [
  "/blog/",
  "/blog/added-via-deployed-decap-dashboard/",
  "/blog/images-in-markdown-posts/",
  "/projects/project-1/",
  "/projects/project-2/",
];
for (const route of [...removedRoutes, "/dev/og/"]) {
  await assert.rejects(
    stat(join(dist, route, "index.html")),
    { code: "ENOENT" },
    `${route}: not generated`,
  );
}
const sitemap = await readFile(join(dist, "sitemap-0.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);
assert(sitemapUrls.length > 0, "Sitemap contains URLs");
for (const page of Object.values(pages))
  assert(
    sitemapUrls.includes(`${origin}${page.route}`),
    `${page.route}: present in sitemap`,
  );
for (const url of sitemapUrls) {
  const pageUrl = new URL(url);
  assert.equal(pageUrl.origin, origin, "Production sitemap origin");
  assert(
    ![...removedRoutes, "/dev/", "/admin/"].some((route) =>
      pageUrl.pathname.startsWith(route),
    ),
    `${pageUrl.pathname}: no demo, admin or development route in sitemap`,
  );
}
const robots = await readFile(join(dist, "robots.txt"), "utf8");
assert.deepEqual(
  [...robots.matchAll(/^Sitemap:\s*(\S+)\s*$/gim)].map((match) => match[1]),
  [`${origin}/sitemap-index.xml`],
  "Robots points to production sitemap index",
);

const iconSizes = new Map([
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["favicon-96x96.png", 96],
  ["apple-touch-icon.png", 180],
  ["mstile-150x150.png", 150],
  ["web-app-manifest-192x192.png", 192],
  ["web-app-manifest-512x512.png", 512],
]);
const brandMark = await readFile(join(dist, "assets/brand/rod-mark.png"));
const brandImage = await sharp(brandMark).metadata();
assert.equal(brandImage.format, "png");
assert.equal(brandImage.width, 512);
assert.equal(brandImage.height, 512);
const representativePhoto = await sharp(
  join(dist, "assets/brand/rod-at-work.jpg"),
).metadata();
assert.equal(representativePhoto.format, "jpeg");
assert(
  representativePhoto.width > 0 && representativePhoto.height > 0,
  "Public business photo resolves",
);
for (const [file, size] of iconSizes) {
  const icon = await sharp(join(dist, "assets/favicons", file)).metadata();
  assert.equal(icon.format, "png", `${file}: PNG image`);
  assert.equal(icon.width, size, `${file}: expected width`);
  assert.equal(icon.height, size, `${file}: expected height`);
}
const manifest = JSON.parse(
  await readFile(join(dist, "assets/favicons/site.webmanifest"), "utf8"),
);
assert.equal(manifest.name, "Rod's Electrical Services");
assert.equal(manifest.short_name, "Rod's Electrical");
assert.deepEqual(manifest.icons.map((icon) => icon.sizes).sort(), [
  "192x192",
  "512x512",
]);
for (const icon of manifest.icons) {
  assert.equal(icon.type, "image/png");
  const size = iconSizes.get(icon.src.split("/").at(-1));
  assert(size, "Manifest points to generated brand icons");
  assert.equal(icon.sizes, `${size}x${size}`);
}
const ico = await readFile(join(dist, "assets/favicons/favicon.ico"));
assert.equal(ico.readUInt16LE(2), 1, "Favicon ICO type");
assert.equal(ico.readUInt16LE(4), 3, "Favicon ICO includes three sizes");

console.log(
  `Validated ${Object.keys(pages).length} business pages, ${cards.length} 1200x630 PNG cards, business schema, sitemap and brand icons.`,
);
