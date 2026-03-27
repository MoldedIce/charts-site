import { ReferenceDot } from "recharts";
import { puzzleTheme } from "./puzzle-theme";

type EndpointLabelProps = {
  x: number;
  y: number;
  value: string;
  fill: string;
  fontWeight?: number;
  opacity?: number;
};

export function EndpointLabel({
  x,
  y,
  value,
  fill,
  fontWeight = 500,
  opacity = 1,
}: EndpointLabelProps) {
  return (
    <ReferenceDot
      x={x}
      y={y}
      r={0}
      ifOverflow="extendDomain"
      label={{
        value,
        position: "right",
        fill,
        opacity,
        fontSize: puzzleTheme.labels.endpointFontSize,
        fontWeight,
        offset: puzzleTheme.labels.endpointOffset,
      }}
    />
  );
}