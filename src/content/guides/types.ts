import type { QrType } from "@/modules/qr/domain/encoders";

export type Faq = { q: string; a: string };

// Long-form how-to shown under the generator on each /create/<type> page.
export type TypeGuide = {
  title: string;
  intro: string[];
  stepsTitle: string;
  steps: string[];
  usesTitle: string;
  uses: string[];
  tipsTitle: string;
  tips: string[];
  faqTitle: string;
  faq: Faq[];
};

export type Section = { h: string; p?: string[]; steps?: string[]; list?: string[] };

// A tutorial article under /guides.
export type Tutorial = {
  slug: string;
  title: string;
  desc: string;
  minutes: number;
  cta: { href: string; label: string };
  sections: Section[];
};

export type GuideContent = {
  ui: { guides: string; guidesTitle: string; guidesSub: string; read: string; minutes: string; steps: string; related: string; back: string };
  types: Record<QrType, TypeGuide>;
  tutorials: Tutorial[];
};
