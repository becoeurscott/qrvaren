import en from "./en";
import es from "./es";
import fr from "./fr";
import type { GuideContent } from "./types";

const CONTENT: Record<string, GuideContent> = { en, es, fr };

export const guideContent = (locale: string) => CONTENT[locale] ?? en;
export const tutorialSlugs = () => en.tutorials.map((t) => t.slug);
export type { GuideContent, Tutorial, TypeGuide } from "./types";
