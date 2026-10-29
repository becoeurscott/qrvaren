import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same mark as icon.svg, rasterized for iOS home screens (which ignore SVG icons).
export default function AppleIcon() {
  const finder = (left: number, top: number) => (
    <div style={{ position: "absolute", left, top, width: 48, height: 48, border: "11px solid #bfff0a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 16, height: 16, background: "#bfff0a", borderRadius: 3 }} />
    </div>
  );
  const dot = (left: number, top: number, opacity = 1) => (
    <div style={{ position: "absolute", left, top, width: 20, height: 20, background: "#bfff0a", borderRadius: 4, opacity }} />
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#5546ff", position: "relative", display: "flex" }}>
        {finder(28, 28)}{finder(104, 28)}{finder(28, 104)}
        {dot(104, 104)}{dot(132, 132)}{dot(132, 104, 0.55)}{dot(104, 132, 0.55)}
      </div>
    ),
    size,
  );
}
