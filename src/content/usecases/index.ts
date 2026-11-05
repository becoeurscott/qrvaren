import en from "./en";
import es from "./es";
import fr from "./fr";
import type { UseCaseContent } from "./types";

const CONTENT: Record<string, UseCaseContent> = { en, es, fr };

export const useCaseContent = (locale: string) => CONTENT[locale] ?? en;
export const useCaseSlugs = () => en.items.map((u) => u.slug);
export const useCaseFromSlug = (locale: string, slug: string) => useCaseContent(locale).items.find((u) => u.slug === slug);
export type { UseCase, UseCaseContent } from "./types";
