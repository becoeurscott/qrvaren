import { useId } from "react";
import type { TemplateStyle } from "../domain/templates";

// Fixed module pattern for the thumbnails: cheap static SVG, no real QR encoding.
const CELLS = [
  [4, 0], [6, 0], [5, 1], [4, 2], [6, 2], [0, 4], [2, 4], [4, 4], [5, 4], [8, 4], [1, 5], [3, 5], [6, 5], [7, 5],
  [0, 6], [4, 6], [5, 6], [8, 6], [4, 7], [6, 7], [7, 7], [5, 8], [7, 8], [8, 8],
];

/** Mini preview of a template: frame color, background, finder eyes and module shape. */
export function TemplateThumb({ tpl }: { tpl: TemplateStyle }) {
  const gid = useId();
  const fill = tpl.fg2 ? `url(#${gid})` : tpl.fg;
  const eye = tpl.eye ?? tpl.fg;
  const r = tpl.dots === "square" ? 0 : tpl.dots === "dots" ? 0.45 : tpl.dots === "classy" ? 0.2 : 0.3;
  const eyeR = tpl.dots === "square" ? 0 : 0.9;
  const Eye = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x} y={y} width="3" height="3" rx={eyeR} fill="none" stroke={eye} strokeWidth="0.7" />
      <rect x={x + 0.95} y={y + 0.95} width="1.1" height="1.1" rx={eyeR / 3} fill={eye} />
    </g>
  );
  return (
    <svg viewBox="-1.5 -1.5 12 12" className="aspect-square w-full rounded-xl" aria-hidden>
      <rect x="-1.5" y="-1.5" width="12" height="12" rx="2" fill={tpl.frame ? tpl.frameColor : tpl.bg} />
      <rect x="-0.6" y="-0.6" width="10.2" height="10.2" rx="1.2" fill={tpl.bg} />
      {tpl.fg2 && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={tpl.fg} /><stop offset="1" stopColor={tpl.fg2} />
          </linearGradient>
        </defs>
      )}
      <Eye x={0} y={0} /><Eye x={6} y={0} /><Eye x={0} y={6} />
      {CELLS.map(([x, y]) => <rect key={`${x}-${y}`} x={x + 0.1} y={y + 0.1} width="0.8" height="0.8" rx={r} fill={fill} />)}
    </svg>
  );
}
