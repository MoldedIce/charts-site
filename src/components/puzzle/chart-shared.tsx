import { puzzleTheme } from "./puzzle-theme";
import { CHART_MARGIN, type TooltipData } from "./use-chart-layout";
import type { Point } from "../../data/puzzle-types";

type Scale = (value: number) => number;
type LineGen = (data: Point[]) => string | null;

export function ChartGrid({
  yTicks,
  width,
  yScale,
}: {
  yTicks: number[];
  width: number;
  yScale: Scale;
}) {
  return (
    <>
      {yTicks.map((tick) => (
        <line
          key={`grid-${tick}`}
          x1={CHART_MARGIN.left}
          x2={width - CHART_MARGIN.right}
          y1={yScale(tick)}
          y2={yScale(tick)}
          stroke={puzzleTheme.colors.grid}
          strokeWidth={1}
        />
      ))}
    </>
  );
}

export function ChartAxes({
  xTicks,
  yTicks,
  chartHeight,
  xScale,
  yScale,
}: {
  xTicks: number[];
  yTicks: number[];
  chartHeight: number;
  xScale: Scale;
  yScale: Scale;
}) {
  return (
    <>
      {xTicks.map((tick) => (
        <text
          key={`xtick-${tick}`}
          x={xScale(tick)}
          y={chartHeight - CHART_MARGIN.bottom + 16}
          textAnchor="middle"
          fontSize={12}
          fill={puzzleTheme.colors.textSecondary}
        >
          {tick}
        </text>
      ))}
      {yTicks.map((tick) => (
        <text
          key={`ytick-${tick}`}
          x={CHART_MARGIN.left - 8}
          y={yScale(tick)}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={12}
          fill={puzzleTheme.colors.textSecondary}
        >
          {tick}
        </text>
      ))}
    </>
  );
}

export function ChartBaseLine({ data, lineGen }: { data: Point[]; lineGen: LineGen }) {
  return (
    <path
      d={lineGen(data) ?? ""}
      fill="none"
      stroke={puzzleTheme.colors.lineBase}
      strokeWidth={3}
    />
  );
}

export function ChartBaseDots({
  data,
  xScale,
  yScale,
  isMobile,
}: {
  data: Point[];
  xScale: Scale;
  yScale: Scale;
  isMobile: boolean;
}) {
  return (
    <>
      {data.map((pt) => (
        <circle
          key={`dot-${pt.step}`}
          cx={xScale(pt.step)}
          cy={yScale(pt.value)}
          r={isMobile ? 3 : 5}
          fill={puzzleTheme.colors.lineBase}
        />
      ))}
    </>
  );
}

export function ChartHoverGuide({
  tooltip,
  chartHeight,
}: {
  tooltip: TooltipData;
  chartHeight: number;
}) {
  return (
    <line
      x1={tooltip.screenX}
      x2={tooltip.screenX}
      y1={CHART_MARGIN.top}
      y2={chartHeight - CHART_MARGIN.bottom}
      stroke={puzzleTheme.colors.hoverGuide}
      strokeWidth={1.5}
      strokeDasharray="4 6"
      pointerEvents="none"
    />
  );
}

export function ChartTooltip({ tooltip }: { tooltip: TooltipData }) {
  if (tooltip.value === null) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: tooltip.screenX + 12,
        top: Math.max(0, tooltip.screenY - 20),
        background: puzzleTheme.colors.cardBackground,
        border: `1px solid ${puzzleTheme.colors.borderLight}`,
        borderRadius: 12,
        padding: "8px 12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        fontSize: 14,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          marginBottom: 4,
          color: puzzleTheme.colors.textPrimary,
        }}
      >
        Step {tooltip.step}
      </div>
      <div style={{ color: "#344054" }}>{tooltip.value}</div>
    </div>
  );
}
