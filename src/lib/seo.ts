import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { BUSINESS, SITE } from "@/data/client";
import settings from "@/data/seo-pages.json";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_TYPE = "image/png";

export type SocialImage = {
  src: string;
  width: number;
  height: number;
  type: string;
  alt: string;
};

export type PageKey = keyof typeof settings;
export type PageSeo = {
  route: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  photo: string;
  headline: string;
  detail: string;
  alt: string;
};

export type OgCard = PageSeo & {
  key: PageKey | "global";
  label: string;
  photoBytes: Buffer;
  image: SocialImage;
};

const pages: Record<PageKey, PageSeo> = settings;
const labels: Record<PageKey | "global", string> = {
  home: "Edmonton electrician",
  about: "About the company",
  services: "Our electrical services",
  cctv: "Security + low voltage",
  contact: "Contact Rod's Electrical",
  projects: "Project gallery",
  reviews: "Customer feedback",
  global: "Electrical services",
};

function normalizePath(pathname: string) {
  const path = pathname.split(/[?#]/, 1)[0];
  return path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
}

export function getPageSeo(pathname: string): PageSeo | undefined {
  const route = normalizePath(pathname);
  return Object.values(pages).find((page) => page.route === route);
}

export type BrandAssets = {
  regular: Buffer;
  bold: Buffer;
  black: Buffer;
  logo: Buffer;
};

let assetsPromise: Promise<BrandAssets> | undefined;
export function getBrandAssets(): Promise<BrandAssets> {
  if (import.meta.env.DEV) assetsPromise = undefined;
  assetsPromise ??= Promise.all([
    readFile(
      resolve(
        process.cwd(),
        "public/assets/fonts/roboto-v29-latin-regular.woff",
      ),
    ),
    readFile(
      resolve(process.cwd(), "public/assets/fonts/roboto-v29-latin-700.woff"),
    ),
    readFile(
      resolve(process.cwd(), "public/assets/fonts/roboto-v29-latin-900.woff"),
    ),
    readFile(resolve(process.cwd(), "public/assets/brand/rod-mark.png")),
  ]).then(([regular, bold, black, logo]) => ({ regular, bold, black, logo }));
  return assetsPromise;
}

async function makeCard(
  key: PageKey | "global",
  page: PageSeo,
  assets: BrandAssets,
  templateSources: Buffer[],
): Promise<OgCard> {
  const photoBytes = await readFile(resolve(process.cwd(), page.photo));
  const label = labels[key];
  const hash = createHash("sha256")
    .update(
      JSON.stringify({
        key,
        ...page,
        label,
        width: OG_WIDTH,
        height: OG_HEIGHT,
        site: SITE,
        phone: BUSINESS.phoneFormatted,
        city: BUSINESS.address.city,
      }),
    )
    .update(photoBytes)
    .update(assets.regular)
    .update(assets.bold)
    .update(assets.black)
    .update(assets.logo);
  for (const source of templateSources) hash.update(source);
  const slug = `${key}-${hash.digest("hex").slice(0, 16)}`;
  return {
    ...page,
    key,
    label,
    photoBytes,
    image: {
      src: `/og/${slug}.png`,
      width: OG_WIDTH,
      height: OG_HEIGHT,
      type: OG_TYPE,
      alt: page.alt,
    },
  };
}

let cardsPromise: Promise<OgCard[]> | undefined;
export function getOgCards(): Promise<OgCard[]> {
  if (import.meta.env.DEV) cardsPromise = undefined;
  cardsPromise ??= (async () => {
    const [assets, templateSources] = await Promise.all([
      getBrandAssets(),
      Promise.all([
        readFile(resolve(process.cwd(), "src/lib/og-image.ts")),
        readFile(resolve(process.cwd(), "src/lib/seo.ts")),
      ]),
    ]);
    const fallback: PageSeo = {
      ...pages.home,
      title: SITE.title,
      description: SITE.description,
      ogTitle: SITE.title,
      ogDescription: pages.home.ogDescription,
      headline: "Electrical work.\nEdmonton + area.",
      detail: "Residential and commercial electrical service.",
      alt: "Rod's Electrical in Edmonton, with a photo of Rod working on an electrical installation.",
    };
    return Promise.all([
      ...(Object.entries(pages) as [PageKey, PageSeo][]).map(([key, page]) =>
        makeCard(key, page, assets, templateSources),
      ),
      makeCard("global", fallback, assets, templateSources),
    ]);
  })();
  return cardsPromise;
}

export async function getSocialImage(pathname: string): Promise<SocialImage> {
  const cards = await getOgCards();
  const route = normalizePath(pathname);
  return (
    cards.find((card) => card.key !== "global" && card.route === route) ??
    cards.find((card) => card.key === "global")!
  ).image;
}
