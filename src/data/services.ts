import type { ImageMetadata } from "astro";

import commercialCardImage from "@/assets/images/projects/port4.jpg";
import commercialDetailImage from "@/assets/images/projects/port6.jpg";
import lightingCardImage from "@/assets/images/projects/port2.jpg";
import lightingDetailImage from "@/assets/images/projects/port7.jpg";
import panelCardImage from "@/assets/images/projects/port5.jpg";
import panelDetailImage from "@/assets/images/projects/port9.jpg";
import repairsCardImage from "@/assets/images/projects/port1.jpg";
import repairsDetailImage from "@/assets/images/projects/port8.jpg";
import residentialCardImage from "@/assets/images/projects/port3.jpg";
import residentialDetailImage from "@/assets/images/projects/port4.jpg";

export type ServiceHubItem = {
  id: string;
  navLabel: string;
  shortNavLabel: string;
  icon: string;
  title: string;
  shortDescription: string;
  detailHeading: string;
  detailBody: string;
  bullets: string[];
  cardImage: ImageMetadata;
  detailImage: ImageMetadata;
  alt: string;
};

export const serviceHubItems: ServiceHubItem[] = [
  {
    id: "residential-electrical",
    navLabel: "Residential Electrical",
    shortNavLabel: "Residential",
    icon: "tabler:home-2",
    title: "Residential Electrical",
    shortDescription:
      "Complete home electrical services including wiring, outlets, lighting, and upgrades for safe, modern living.",
    detailHeading:
      "Residential electrical work planned cleanly and finished to code.",
    detailBody:
      "From renovation upgrades to everyday fixes, we help Edmonton homeowners keep their electrical systems safe, practical, and ready for modern use.",
    bullets: [
      "Wiring, outlets, switches, and device replacements",
      "Lighting installs, dimmers, and fixture updates",
      "Electrical upgrades for kitchens, basements, and additions",
      "Careful troubleshooting for older homes and legacy wiring",
    ],
    cardImage: residentialCardImage,
    detailImage: residentialDetailImage,
    alt: "Residential electrical installation inside an Edmonton home",
  },
  {
    id: "commercial-electrical",
    navLabel: "Commercial Electrical",
    shortNavLabel: "Commercial",
    icon: "tabler:building",
    title: "Commercial Electrical",
    shortDescription:
      "Reliable electrical solutions for businesses including installations, maintenance, and code compliance.",
    detailHeading:
      "Commercial electrical support that keeps workspaces operating safely.",
    detailBody:
      "We handle business electrical work with a focus on dependable scheduling, code-compliant installs, and practical solutions that reduce disruption.",
    bullets: [
      "Tenant improvements, service upgrades, and new installations",
      "Maintenance work for offices, shops, and mixed-use spaces",
      "Lighting, circuits, and distribution updates for changing needs",
      "Code-minded electrical work with clear communication throughout",
    ],
    cardImage: commercialCardImage,
    detailImage: commercialDetailImage,
    alt: "Commercial electrical work completed inside a business property",
  },
  {
    id: "repairs-troubleshooting",
    navLabel: "Repairs & Troubleshooting",
    shortNavLabel: "Repairs",
    icon: "tabler:tool",
    title: "Repairs & Troubleshooting",
    shortDescription:
      "Fast diagnosis and repair of electrical problems to keep your home or business running smoothly and safely.",
    detailHeading:
      "Troubleshooting that gets to root cause, not temporary fixes.",
    detailBody:
      "When something stops working, starts tripping, or feels unsafe, we diagnose the issue clearly and make repairs that restore confidence in the system.",
    bullets: [
      "Breaker trips, dead outlets, flickering lights, and intermittent faults",
      "Targeted diagnosis before repair work begins",
      "Safe corrections for damaged wiring and failing devices",
      "Fast response for urgent electrical issues and emergency calls",
    ],
    cardImage: repairsCardImage,
    detailImage: repairsDetailImage,
    alt: "Electrical repair and troubleshooting service inside a finished property",
  },
  {
    id: "lighting-installation",
    navLabel: "Lighting Installation",
    shortNavLabel: "Lighting",
    icon: "tabler:bulb",
    title: "Lighting Installation",
    shortDescription:
      "Professional lighting design and installation for enhanced ambiance, security, and energy efficiency.",
    detailHeading:
      "Lighting installation that improves visibility, comfort, and curb appeal.",
    detailBody:
      "We install lighting that looks clean, performs well, and suits the way the space is actually used, whether it is inside the home, outdoors, or in a commercial setting.",
    bullets: [
      "Interior fixture replacements and new lighting layouts",
      "Exterior, security, and pathway lighting installations",
      "Accent, task, and ambient lighting upgrades",
      "Energy-conscious options with controls and dimming where needed",
    ],
    cardImage: lightingCardImage,
    detailImage: lightingDetailImage,
    alt: "Professional lighting installation completed inside a property",
  },
  {
    id: "panel-upgrades-inspections",
    navLabel: "Panel Upgrades",
    shortNavLabel: "Panels",
    icon: "tabler:bolt",
    title: "Panel Upgrades & Inspections",
    shortDescription:
      "Upgrade your electrical panel for modern demands and ensure safety with thorough inspections.",
    detailHeading:
      "Panel upgrades and inspections for safer, more capable electrical systems.",
    detailBody:
      "If your service is outdated, overloaded, or due for review, we help bring the system up to modern demands with straightforward recommendations and safety-first execution.",
    bullets: [
      "Panel replacements and service capacity upgrades",
      "Inspections for renovations, home purchases, and safety concerns",
      "Load planning for new appliances and added circuits",
      "Clear guidance on what needs attention now versus later",
    ],
    cardImage: panelCardImage,
    detailImage: panelDetailImage,
    alt: "Electrical panel upgrade and inspection support for a property",
  },
];

export const serviceNavChildren = serviceHubItems.map((service) => ({
  key: service.navLabel,
  url: `/services/#${service.id}`,
}));
