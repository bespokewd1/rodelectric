export type HomeFAQItem = {
  question: string;
  answer: string;
  items?: string[];
};

export const homeFaqItems: HomeFAQItem[] = [
  {
    question: "What electrical services does Rod's Electrical offer in Edmonton?",
    answer:
      "Rod's Electrical provides residential and commercial electrical services in Edmonton and area, including:",
    items: [
      "Residential electrical",
      "Commercial electrical",
      "Repairs and troubleshooting",
      "Lighting installation",
      "Panel upgrades and inspections",
      "24/7 emergency electrical services",
    ],
  },
  {
    question: "Do you offer 24/7 emergency electrical services in Edmonton?",
    answer:
      "Yes. Rod's Electrical offers round-the-clock emergency electrical support with fast response when urgent electrical problems need attention.",
  },
  {
    question: "Do you handle both residential and commercial electrical work?",
    answer:
      "Yes. The site lists complete home electrical services such as wiring, outlets, lighting, and upgrades, along with commercial installations, maintenance, repairs, and code-compliant electrical solutions for businesses.",
  },
  {
    question: "Are your electricians licensed and insured?",
    answer:
      "Yes. Rod's Electrical presents itself as a fully licensed and insured company with a journeyman certified electrician and more than 14 years of industry experience.",
  },
  {
    question: "Can you help with panel upgrades and electrical inspections?",
    answer:
      "Yes. Rod's Electrical upgrades outdated panels for modern electrical demands and performs thorough inspections to help keep homes and businesses safe and up to code.",
  },
  {
    question: "How can I get a free quote for electrical work?",
    answer:
      "You can call (587) 399-3722 or use the online contact form to request a free quote. The site also says pricing is upfront with no hidden fees and that inquiries are answered within 24 hours or less.",
  },
  {
    question: "What areas does Rod's Electrical serve?",
    answer:
      "Rod's Electrical is locally owned and operated in Edmonton and serves Edmonton and the surrounding area for residential and commercial electrical services.",
  },
];

export function getHomeFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaqItems.map(({ question, answer, items }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: items?.length
          ? `${answer.replace(/:\s*$/, ":")} ${items.join(", ")}.`
          : answer,
      },
    })),
  };
}
