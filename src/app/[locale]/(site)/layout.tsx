import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ConsentBanner } from "@/components/ConsentBanner";
import { Cursor, ScrollFx } from "@/components/interactions";

// Public site chrome. The admin panel lives outside this group and has its own shell.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
      <ConsentBanner />
      <ScrollFx />
      <Cursor />
    </>
  );
}
