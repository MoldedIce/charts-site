import { useMemo } from "react";
import type { Point, PuzzleDefinition } from "../../data/puzzle-types";
import {
  getCandidateLines,
  getCorrectAnswer,
  getLastBasePoint,
  getSelectedAnswer,
  getTargetStep,
} from "./puzzle-chart-utils";
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

type PuzzleChartProps = {
  puzzle: PuzzleDefinition;
  selectedAnswerId: string | null;
  hoveredAnswerId: string | null;
  hasAnswered: boolean;
  isCorrect: boolean;
};

export function PuzzleChart({
  puzzle,
  selectedAnswerId,
  hoveredAnswerId,
  hasAnswered,
  isCorrect,
}: PuzzleChartProps) {
  const { baseData } = puzzle;
  const targetStep = getTargetStep(baseData);
  const correctAnswer = getCorrectAnswer(puzzle);
  const selectedAnswer = getSelectedAnswer(puzzle, selectedAnswerId);
  const candidateLines = getCandidateLines(puzzle);

  const allValues = useMemo(
    () => [...baseData.map((d) => d.value), ...puzzle.answers.map((a) => a.value)],
    [baseData, puzzle.answers]
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
  } = useChartLayout(allValues, targetStep, baseData);

  if (!correctAnswer) return null;

  const lastBasePoint = getLastBasePoint(baseData);
  const correctNextPoint: Point = { step: targetStep, value: correctAnswer.value };
  const selectedAnswerPoint: Point | null = selectedAnswer
    ? { step: targetStep, value: selectedAnswer.value }
    : null;

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

        {/* Candidate lines (pre-answer) */}
        {!hasAnswered &&
          candidateLines.map((cLine) => {
            const isHovered = hoveredAnswerId === cLine.id;
            const isDimmed = hoveredAnswerId !== null && !isHovered;
            const endPt = cLine.data[cLine.data.length - 1];
            return (
              <g key={`candidate-${cLine.id}`}>
                <path
                  d={lineGen(cLine.data) ?? ""}
                  fill="none"
                  stroke={
                    isHovered
                      ? puzzleTheme.colors.lineCandidateHover
                      : puzzleTheme.colors.lineCandidate
                  }
                  strokeWidth={isHovered ? 2.5 : 2}
                  strokeDasharray="6 6"
                  opacity={isDimmed ? 0.55 : 1}
                />
                <text
                  x={xScale(endPt.step) + puzzleTheme.labels.endpointOffset}
                  y={yScale(endPt.value)}
                  dominantBaseline="middle"
                  fontSize={puzzleTheme.labels.endpointFontSize}
                  fontWeight={isHovered ? 700 : 500}
                  fill={
                    isHovered
                      ? puzzleTheme.colors.labelHover
                      : puzzleTheme.colors.labelNeutral
                  }
                  opacity={isDimmed ? 0.9 : 1}
                >
                  {cLine.label}
                </text>
              </g>
            );
          })}

        <ChartBaseLine data={baseData} lineGen={lineGen} />

        {/* Result: incorrect selection */}
        {hasAnswered && !isCorrect && selectedAnswerPoint && (
          <g>
            <path
              d={lineGen([lastBasePoint, selectedAnswerPoint]) ?? ""}
              fill="none"
              stroke={puzzleTheme.colors.incorrect}
              strokeWidth={2}
              strokeDasharray="6 6"
            />
            <circle
              cx={xScale(selectedAnswerPoint.step)}
              cy={yScale(selectedAnswerPoint.value)}
              r={isMobile ? 3 : 5}
              fill={puzzleTheme.colors.incorrect}
            />
            <text
              x={
                xScale(selectedAnswerPoint.step) +
                puzzleTheme.labels.endpointOffset
              }
              y={yScale(selectedAnswerPoint.value)}
              dominantBaseline="middle"
              fontSize={puzzleTheme.labels.endpointFontSize}
              fontWeight={700}
              fill={puzzleTheme.colors.incorrect}
            >
              {selectedAnswerPoint.value}
            </text>
          </g>
        )}

        {/* Result: correct line */}
        {hasAnswered && (
          <g>
            <path
              d={lineGen([lastBasePoint, correctNextPoint]) ?? ""}
              fill="none"
              stroke={puzzleTheme.colors.correct}
              strokeWidth={3}
            />
            <circle
              cx={xScale(correctNextPoint.step)}
              cy={yScale(correctNextPoint.value)}
              r={isMobile ? 3 : 5}
              fill={puzzleTheme.colors.correct}
            />
            <text
              x={
                xScale(correctNextPoint.step) + puzzleTheme.labels.endpointOffset
              }
              y={yScale(correctNextPoint.value)}
              dominantBaseline="middle"
              fontSize={puzzleTheme.labels.endpointFontSize}
              fontWeight={700}
              fill={puzzleTheme.colors.correct}
            >
              {correctNextPoint.value}
            </text>
          </g>
        )}

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
