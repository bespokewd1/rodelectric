import { SITE, BUSINESS } from "@/data/client";

export function getLocalBusinessSchema(origin) {
	const sameAs = Object.values(BUSINESS.socials ?? {}).filter(Boolean);
	const streetAddress = [BUSINESS.address.lineOne, BUSINESS.address.lineTwo].filter(Boolean).join(", ");

	return {
		"@context": "https://schema.org",
		"@type": ["LocalBusiness", "WebSite"],
		"name": BUSINESS.name,
		"url": SITE.url,
		"logo": origin + BUSINESS.logo,
		"image": origin + BUSINESS.logo,
		"email": BUSINESS.email,
		"telephone": BUSINESS.phoneForTel,
		"address": {
			"@type": "PostalAddress",
			"streetAddress": streetAddress,
			"addressLocality": BUSINESS.address.city,
			"addressRegion": BUSINESS.address.state,
			"postalCode": BUSINESS.address.zip,
		},
		"sameAs": sameAs,
		"inLanguage": SITE.locale,
	};
}
