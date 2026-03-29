import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { ScenarioPuzzleDefinition } from "../../data/puzzle-types";
import { useIsMobile } from "../../hooks/useIsMobile";
import { EndpointLabel } from "./EndpointLabel";
import { getLastBasePoint } from "./puzzle-chart-utils";
import { puzzleTheme } from "./puzzle-theme";

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

  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 280 : puzzleTheme.sizes.chartHeight;
  const chartRightMargin = isMobile ? 48 : 80;

  const lastBasePoint = getLastBasePoint(baseData);
  const lastStep = scenarios[0].data[scenarios[0].data.length - 1].step;
  const totalSteps = lastStep;
  const ticks = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const tickInterval = isMobile && ticks.length > 7 ? 1 : 0;

  return (
    <div
      style={{
        width: "100%",
        height: chartHeight,
        padding: "24px 0",
        boxSizing: "border-box",
        marginBottom: 28,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={baseData}
          margin={{ top: 20, right: chartRightMargin, left: 10, bottom: 10 }}
        >
          <CartesianGrid stroke={puzzleTheme.colors.grid} vertical={false} />

          <XAxis
            dataKey="step"
            tickLine={false}
            axisLine={false}
            type="number"
            domain={[1, totalSteps]}
            ticks={ticks}
            interval={tickInterval}
            tick={{ fontSize: 12 }}
          />

          <YAxis tickLine={false} axisLine={false} width={40} tick={{ fontSize: 12 }} />

          {/* Base data line */}
          <Line
            type="monotone"
            dataKey="value"
            data={baseData}
            stroke={puzzleTheme.colors.lineBase}
            strokeWidth={3}
            dot={{
              r: isMobile ? 3 : 5,
              fill: puzzleTheme.colors.lineBase,
              stroke: puzzleTheme.colors.lineBase,
            }}
            activeDot={false}
            isAnimationActive={false}
          />

          {/* Scenario lines */}
          {scenarios.map((scenario) => {
            const isSelected = selectedId === scenario.id;
            const isCorrectScenario = scenario.id === puzzle.correctScenarioId;
            const isHovered = hoveredId === scenario.id;
            const isDimmed = hoveredId !== null && !isHovered;

            let stroke: string = isHovered
              ? puzzleTheme.colors.lineCandidateHover
              : puzzleTheme.colors.lineCandidate;
            let strokeWidth = isHovered ? 2.5 : 2;
            let strokeDasharray = "6 6";
            let opacity = isDimmed ? 0.45 : 1;

            if (hasAnswered) {
              if (isCorrectScenario) {
                stroke = puzzleTheme.colors.correct;
                strokeWidth = 3;
                strokeDasharray = "0";
                opacity = 1;
              } else if (isSelected) {
                stroke = puzzleTheme.colors.incorrect;
                strokeWidth = 2;
                opacity = 1;
              } else {
                opacity = 0.15;
              }
            }

            return (
              <Line
                key={scenario.id}
                type="monotone"
                dataKey="value"
                data={[lastBasePoint, ...scenario.data]}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                dot={false}
                activeDot={false}
                opacity={opacity}
                isAnimationActive={false}
              />
            );
          })}

          {/* Endpoint labels */}
          {scenarios.map((scenario) => {
            const isSelected = selectedId === scenario.id;
            const isCorrectScenario = scenario.id === puzzle.correctScenarioId;
            const isHovered = hoveredId === scenario.id;
            const isDimmed = hoveredId !== null && !isHovered;
            const endPoint = scenario.data[scenario.data.length - 1];

            let fill: string = isHovered
              ? puzzleTheme.colors.labelHover
              : puzzleTheme.colors.labelNeutral;
            let opacity = isDimmed ? 0.45 : 1;
            let fontWeight = isHovered ? 700 : 500;

            if (hasAnswered) {
              if (isCorrectScenario) {
                fill = puzzleTheme.colors.correct;
                fontWeight = 700;
                opacity = 1;
              } else if (isSelected) {
                fill = puzzleTheme.colors.incorrect;
                fontWeight = 600;
                opacity = 1;
              } else {
                fill = puzzleTheme.colors.labelNeutral;
                opacity = 0.3;
              }
            }

            return (
              <EndpointLabel
                key={`label-${scenario.id}`}
                x={endPoint.step}
                y={endPoint.value}
                value={scenario.label}
                fill={fill}
                opacity={opacity}
                fontWeight={fontWeight}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
