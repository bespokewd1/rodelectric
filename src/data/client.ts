// ===== SITE CONSTANTS =====
export const SITE = {
	title: "Rod's Electrical Services",
	tagline: "Trusted Edmonton Electrician",
	description: "Rod's Electrical provides residential, commercial, lighting, panel upgrade, troubleshooting, and 24/7 emergency electrical services in Edmonton and area.",
	url: "https://rodselectrical.ca",
	author: "Rod's Electrical Services",
	locale: "en",
};

// ===== BUSINESS INFO =====
export const BUSINESS = {
	name: SITE.title,
	email: "info@rodselectrical.ca",
	phoneForTel: "5873993722",
	phoneFormatted: "(587) 399-3722",
	logo: "/assets/favicons/favicon.svg",
	address: {
		lineOne: "11902 70 St NW",
		lineTwo: "",
		city: "Edmonton",
		state: "AB",
		zip: "T5B 1T9",
		mapLink: "https://maps.google.com/?q=11902+70+St+NW+Edmonton+AB+T5B+1T9",
	},
	socials: {
		linkedin: "",
		facebook: "",
		instagram: "",
	},
};

// ===== SEO DEFAULTS =====
export const SEO = {
	title: SITE.title,
	description: SITE.description,
};

// ===== OPEN GRAPH DEFAULTS =====
export const OG = {
	locale: "en_US",
	image: "/assets/social.jpg", // Default fallback social image located in public/
};
