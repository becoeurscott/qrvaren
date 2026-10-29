import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// icon.svg rasterized for iOS home screens (which ignore SVG icons).
export default function AppleIcon() {
  const svg = readFileSync(join(process.cwd(), "src/app/icon.svg"), "utf8").replace('rx="14"', 'rx="0"');
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return new ImageResponse(<img src={src} width={180} height={180} />, size);
}
