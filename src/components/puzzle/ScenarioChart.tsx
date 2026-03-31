import { useMemo } from "react";
import type { ScenarioPuzzleDefinition } from "../../data/puzzle-types";
import { getLastBasePoint } from "./puzzle-chart-utils";
import { puzzleTheme } from "./puzzle-theme";
import { useChartLayout } from "./use-chart-layout";
import {
  ChartAxes,
  ChartBaseDots,
  ChartBaseLine,
  ChartGrid,
  ChartHoverGuide,
  ChartTooltip,
} from "./chart-shared";

type ScenarioChartProps = {
  puzzle: ScenarioPuzzleDefinition;
  selectedId: string | null;
  hoveredId: string | null;
  hasAnswered: boolean;
};

export function ScenarioChart({
  puzzle,
  selectedId,
  hoveredId,
  hasAnswered,
}: ScenarioChartProps) {
  const { baseData, scenarios } = puzzle;
  const lastStep = scenarios[0].data[scenarios[0].data.length - 1].step;
  const lastBasePoint = getLastBasePoint(baseData);

  const allValues = useMemo(
    () => [
      ...baseData.map((d) => d.value),
      ...scenarios.flatMap((s) => s.data.map((d) => d.value)),
    ],
    [baseData, scenarios]
  );

  const {
    containerRef,
    width,
    isMobile,
    chartHeight,
    xScale,
    yScale,
    lineGen,
    tooltip,
    setTooltip,
    updateTooltip,
    yTicks,
    xTicks,
  } = useChartLayout(allValues, lastStep, baseData);

  if (width === 0 || !xScale || !yScale || !lineGen) {
    return (
      <div
        ref={containerRef}
        style={{ width: "100%", height: chartHeight, marginBottom: 28 }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: isMobile ? undefined : puzzleTheme.sizes.chartMaxWidth,
        height: chartHeight,
        marginBottom: 10,
      }}
      onMouseLeave={() => setTooltip(null)}
    >
      <svg
        width={width}
        height={chartHeight}
        onMouseMove={(e) => updateTooltip(e.clientX, e.clientY)}
        onTouchMove={(e) =>
          updateTooltip(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={() => setTooltip(null)}
        style={{ touchAction: "pan-y", display: "block" }}
      >
        <ChartGrid yTicks={yTicks} width={width} yScale={yScale} />
        <ChartAxes
          xTicks={xTicks}
          yTicks={yTicks}
          chartHeight={chartHeight}
          xScale={xScale}
          yScale={yScale}
        />

        <ChartBaseLine data={baseData} lineGen={lineGen} />

        {/* Scenario lines + labels — sorted so correct renders last (on top) */}
        {[...scenarios]
          .sort((a, b) => {
            if (!hasAnswered) return 0;
            if (a.id === puzzle.correctScenarioId) return 1;
            if (b.id === puzzle.correctScenarioId) return -1;
            return 0;
          })
          .map((scenario) => {
            const isSelected = selectedId === scenario.id;
            const isCorrectScenario = scenario.id === puzzle.correctScenarioId;
            const isHovered = hoveredId === scenario.id;
            const isDimmed = hoveredId !== null && !isHovered;
            const endPt = scenario.data[scenario.data.length - 1];

            let stroke: string = isHovered
              ? puzzleTheme.colors.lineCandidateHover
              : puzzleTheme.colors.lineCandidate;
            let strokeWidth = isHovered ? 2.5 : 2;
            let strokeDasharray = "6 6";
            let opacity = isDimmed ? 0.45 : 1;
            let labelFill: string = isHovered
              ? puzzleTheme.colors.labelHover
              : puzzleTheme.colors.labelNeutral;
            let labelOpacity = isDimmed ? 0.45 : 1;
            let labelWeight = isHovered ? 700 : 500;

            if (hasAnswered) {
              if (isCorrectScenario) {
                stroke = puzzleTheme.colors.correct;
                strokeWidth = 3;
                strokeDasharray = "0";
                opacity = 1;
                labelFill = puzzleTheme.colors.correct;
                labelWeight = 700;
                labelOpacity = 1;
              } else if (isSelected) {
                stroke = puzzleTheme.colors.incorrect;
                strokeWidth = 2;
                opacity = 1;
                labelFill = puzzleTheme.colors.incorrect;
                labelWeight = 600;
                labelOpacity = 1;
              } else {
                opacity = 0.15;
                labelOpacity = 0.3;
              }
            }

            return (
              <g key={scenario.id}>
                <path
                  d={lineGen([lastBasePoint, ...scenario.data]) ?? ""}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  opacity={opacity}
                />
                <text
                  x={xScale(endPt.step) + puzzleTheme.labels.endpointOffset}
                  y={yScale(endPt.value)}
                  dominantBaseline="middle"
                  fontSize={puzzleTheme.labels.endpointFontSize}
                  fontWeight={labelWeight}
                  fill={labelFill}
                  opacity={labelOpacity}
                >
                  {scenario.label}
                </text>
              </g>
            );
          })}

        {/* Base dots — rendered last so they appear on top of all lines */}
        <ChartBaseDots data={baseData} xScale={xScale} yScale={yScale} isMobile={isMobile} />

        {/* Hover guide */}
        {tooltip && <ChartHoverGuide tooltip={tooltip} chartHeight={chartHeight} />}
      </svg>

      {/* Tooltip */}
      {tooltip && <ChartTooltip tooltip={tooltip} />}
    </div>
  );
}
