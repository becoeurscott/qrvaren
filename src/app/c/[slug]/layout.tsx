import { Anton, Bricolage_Grotesque } from "next/font/google";
import { getPublicCard } from "@/modules/cards/application/public";
import "../../globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });

// Public card pages live outside [locale]: the language is the card's own.
export default async function CardLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getPublicCard(slug);
  return (
    <html lang={card?.locale ?? "en"}>
      <body className={`${anton.variable} ${bricolage.variable} min-h-screen bg-ink font-sans antialiased`}>{children}</body>
    </html>
  );
}
