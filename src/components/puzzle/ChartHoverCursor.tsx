import { puzzleTheme } from "./puzzle-theme";

type ChartHoverCursorProps = {
  points?: Array<{ x: number; y: number }>;
  height?: number;
  top?: number;
  left?: number;
};

export function ChartHoverCursor({
  points,
  height,
  top = 0,
}: ChartHoverCursorProps) {
  if (!points || points.length === 0 || typeof height !== "number") {
    return null;
  }

  const x = points[0]?.x;

  if (typeof x !== "number") {
    return null;
  }

  return (
    <line
      x1={x}
      x2={x}
      y1={top}
      y2={top + height}
      stroke={puzzleTheme.colors.hoverGuide}
      strokeWidth={1.5}
      strokeDasharray="4 6"
    />
  );
}