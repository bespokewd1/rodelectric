import { SITE, BUSINESS } from "@/data/client";

export function getLocalBusinessSchema() {
  const sameAs = Object.values(BUSINESS.socials).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Electrician",
    "@id": `${SITE.url}/#business`,
    name: BUSINESS.name,
    url: SITE.url,
    logo: new URL(BUSINESS.logo, SITE.url).href,
    image: new URL(BUSINESS.image, SITE.url).href,
    email: BUSINESS.email,
    telephone: `+1${BUSINESS.phoneForTel}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: [BUSINESS.address.lineOne, BUSINESS.address.lineTwo].filter(Boolean).join(", "),
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.state,
      postalCode: BUSINESS.address.zip,
      addressCountry: "CA",
    },
    areaServed: BUSINESS.serviceArea,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
