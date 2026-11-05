import en from "./en";
import es from "./es";
import fr from "./fr";
import type { UseCaseContent } from "./types";

const CONTENT: Record<string, UseCaseContent> = { en, es, fr };

export const getUseCases = (locale: string) => CONTENT[locale] ?? en;
export const usecaseSlugs = () => en.items.map((u) => u.slug);
export const findUseCase = (locale: string, slug: string) => getUseCases(locale).items.find((u) => u.slug === slug);
export type { UseCase, UseCaseContent } from "./types";
