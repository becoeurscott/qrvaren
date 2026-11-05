import type { QrType } from "@/modules/qr/domain/encoders";
import type { TypeGuide } from "../guides/types";

// A use-case landing page at /create/<slug>: an existing QR type framed for one audience and search intent.
export type UseCase = {
  slug: string;
  type: QrType;
  /** <title> and link label. */
  title: string;
  h1: string;
  desc: string;
  guide: TypeGuide;
};

export type UseCaseContent = { related: string; items: UseCase[] };
