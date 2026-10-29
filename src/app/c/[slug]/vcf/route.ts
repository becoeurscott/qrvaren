import { NextResponse } from "next/server";
import { getPublicCard } from "@/modules/cards/application/public";
import { cardVCard, slugify } from "@/modules/cards/domain/card";
import { cardUrl } from "@/modules/cards/domain/cardUrl";

// "Save contact" button: the card as a vCard file.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getPublicCard(slug);
  if (!card || card.status !== "active") return new NextResponse("Not found", { status: 404 });
  return new NextResponse(cardVCard(card, cardUrl(card.slug)), {
    headers: {
      "content-type": "text/vcard; charset=utf-8",
      "content-disposition": `attachment; filename="${slugify(card.name)}.vcf"`,
      "cache-control": "public, max-age=300",
    },
  });
}
