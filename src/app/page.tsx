import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// Middleware handles locale detection; this is only a fallback.
export default function Root() {
  redirect(`/${routing.defaultLocale}`);
}
