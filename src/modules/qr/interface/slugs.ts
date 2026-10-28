import { QR_TYPES, type QrType } from "../domain/encoders";

// English URL slugs targeting search intents ("wifi qr code", ...), shared by all locales.
const SLUGS: Record<QrType, string> = {
  url: "url-qr-code",
  wifi: "wifi-qr-code",
  text: "text-qr-code",
  vcard: "vcard-qr-code",
  email: "email-qr-code",
  sms: "sms-qr-code",
  pdf: "pdf-qr-code",
  card: "business-card",
};

export const typeSlug = (t: QrType) => SLUGS[t];
export const typeFromSlug = (s: string): QrType | undefined => QR_TYPES.find((t) => SLUGS[t] === s);
export const allTypeSlugs = () => QR_TYPES.map((t) => SLUGS[t]);
